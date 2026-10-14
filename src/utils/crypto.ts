/**
 * Deterministic synchronous password hashing simulation
 * Stored passwords in localStorage will look like standard pbkdf2 signatures
 */
export function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  
  const reversed = password.split('').reverse().join('');
  let hash2 = 0;
  for (let i = 0; i < reversed.length; i++) {
    const char = reversed.charCodeAt(i);
    hash2 = (hash2 << 5) - hash2 + char;
    hash2 = hash2 & hash2;
  }
  const hex2 = Math.abs(hash2).toString(16).padStart(8, '0');
  return `pbkdf2_sha256$200000$salt_inivra$${hex}${hex2}`;
}

/**
 * Generate a cryptographically secure looking token
 */
export function generateToken(): string {
  const parts = [];
  for (let i = 0; i < 4; i++) {
    parts.push(Math.random().toString(36).substring(2, 10));
  }
  return parts.join('.');
}

/**
 * Capture browser/device info to simulate device recognition
 */
export function getDeviceInfo(): { deviceName: string; browser: string; os: string } {
  const ua = navigator.userAgent;
  let browser = 'Chrome';
  let os = 'Windows';
  
  if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
  else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) browser = 'Safari';
  else if (ua.indexOf('Edge') > -1) browser = 'Edge';

  if (ua.indexOf('Mac') > -1) os = 'macOS';
  else if (ua.indexOf('Linux') > -1) os = 'Linux';
  else if (ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) os = 'iOS';
  else if (ua.indexOf('Android') > -1) os = 'Android';

  const deviceName = `${os} Laptop / Workstation`;
  return { deviceName, browser, os };
}
