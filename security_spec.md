# Security Specification: Inivra Learn Firebase Architecture

## 1. Data Invariants
- Users can only read/write their own user profile document (`/users/{userId}` where `request.auth.uid == userId`) unless accessed by an Admin.
- Email verification must be respected where applicable (`request.auth.token.email_verified == true`).
- Bootstrapped Admin: `iniestaedgar20@gmail.com` has administrator privileges.
- Courses can be created by authenticated instructors/educators where `authorId` or `educatorId` matches `request.auth.uid`.
- Classrooms can be managed by the creator teacher (`teacherId == request.auth.uid`) or admin.
- Bookings must tie either the `studentId` or `tutorId` to `request.auth.uid`.
- Messages must ensure `senderId == request.auth.uid` and belong to a conversation the user participates in.

## 2. The "Dirty Dozen" Threat Payloads (Must return PERMISSION_DENIED)
1. **Unauthenticated User Profile Read**: Anonymous/unauthenticated `get` on `/users/user-123`.
2. **Identity Spoofing Profile Write**: Authenticated user `attacker_uid` writing `/users/victim_uid`.
3. **Role Escalation Attack**: Normal user updating their profile with `"role": "Admin"`.
4. **Oversized String Poisoning**: Creating course with 10MB title payload.
5. **Arbitrary Schema Injection**: Creating user document with extra unauthorized ghost properties.
6. **Fake Course Educator**: Creating course where `educatorId != request.auth.uid`.
7. **Cross-User Booking Manipulation**: User C cancelling booking between User A and User B.
8. **Message Impersonation**: Sending chat message where `senderId` is spoofed as teacher.
9. **Orphaned Message Write**: Writing message to a non-existent or inaccessible conversation.
10. **Marketplace Resource Hijack**: Editing another instructor's published resource or price.
11. **Blanket Query Scraping**: Attempting an unrestricted collection query across all private user profiles.
12. **School Approval Bypass**: Non-admin approving pending school registrations.
