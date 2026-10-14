import React, { useState, useEffect, useRef } from 'react';
import { Camera, Mic, ScreenShare, Layout, Download, Play, Square, Settings, Send, RotateCcw, AlertCircle, FileText, CheckCircle } from 'lucide-react';

interface VideoCallSimulatorProps {
  classId: string;
  className: string;
  teacherName: string;
  currentUserName: string;
  onExit: () => void;
}

export default function VideoCallSimulator({ classId, className, teacherName, currentUserName, onExit }: VideoCallSimulatorProps) {
  // Video toggles
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [sharingScreen, setSharingScreen] = useState(false);
  const [whiteboardMode, setWhiteboardMode] = useState(false);

  // Chat Log State
  const [chatLog, setChatLog] = useState<{ sender: string; text: string; time: string }[]>([
    { sender: teacherName, text: "Good afternoon everyone! Let's review classical mechanics work-energy formulas today.", time: "11:00 AM" },
    { sender: "Sophia Martinez", text: "Dr. Sarah, does the conservative forces path-integral derivation apply to non-rigid wheels?", time: "11:02 AM" },
    { sender: teacherName, text: "Excellent query, Sophia. Yes! In rolling without slipping, standard energy forms sum nicely.", time: "11:04 AM" }
  ]);
  const [newChatText, setNewChatText] = useState("");

  // Whiteboard Canvas State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [color, setColor] = useState('#4f46e5'); // Indigo default
  const [lineWidth, setLineWidth] = useState(4);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const isDrawingRef = useRef(false);

  // AI Meeting Summarizer State
  const [aiSummary, setAiSummary] = useState<string>('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Attendance Records inside Virtual class
  const attendees = [
    { name: teacherName, role: 'Teacher', status: 'Host' },
    { name: currentUserName, role: 'Student', status: 'Connected' },
    { name: 'Sophia Martinez', role: 'Student', status: 'Connected' },
    { name: 'Lucas Thorne', role: 'Student', status: 'Connected' }
  ];

  // Draw on Whiteboard
  useEffect(() => {
    if (whiteboardMode && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
      }
    }
  }, [whiteboardMode]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    isDrawingRef.current = true;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = tool === 'eraser' ? 20 : lineWidth;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatText.trim()) return;
    setChatLog(prev => [...prev, {
      sender: currentUserName,
      text: newChatText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setNewChatText('');
  };

  // Automated AI Lesson summaries triggered during the video call
  const generateAiMeetingSummary = async () => {
    setLoadingSummary(true);
    setAiSummary('');
    try {
      // Gather meeting context from active chat log
      const transcript = chatLog.map(c => `${c.sender}: ${c.text}`).join('\n');
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Please synthesize and draft a meeting summary based on this lesson transcription:\n\n${transcript}`,
          context: `You are an expert AI Curriculum Writer in the virtual classroom. Create a professional, clean outline listing Key Topics Discussed, Homework Assigned, and follow-up guidelines.`,
          systemInstruction: "You are the Inivra AI meeting recorder assistant."
        })
      });
      const data = await response.json();
      setAiSummary(data.text || "Meeting Summary: The instructor introduced work-energy formulas and classical dynamics. Students reviewed rolling-without-slipping conditions and derived polynomial limits.");
    } catch (e) {
      setAiSummary("Meeting Summary: The instructor introduced work-energy formulas and classical dynamics. Students reviewed rolling-without-slipping conditions and derived polynomial limits.");
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <div id="video-call-simulator" className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col font-sans">
      
      {/* Top Header info */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-pulse" />
          <div>
            <h2 className="font-bold text-sm tracking-tight">{className} - Virtual Classroom</h2>
            <p className="text-xs text-slate-400 font-mono">Classroom code: {classId} • Host: {teacherName}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 font-mono">
            Attendees: {attendees.length} online
          </span>
          <button 
            id="btn-leave-call"
            onClick={onExit}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-lg transition-colors shadow-lg shadow-rose-600/20 uppercase tracking-wider"
          >
            Leave Virtual Class
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 h-full min-h-0 overflow-hidden">
        
        {/* Left Side: Video grid / Screen sharing / Whiteboard */}
        <div className="lg:col-span-3 flex flex-col p-4 space-y-4 overflow-y-auto">
          
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden flex items-center justify-center min-h-[350px]">
            {whiteboardMode ? (
              /* Collaborative canvas */
              <div className="absolute inset-0 bg-white text-slate-800 flex flex-col">
                <div className="bg-slate-100 p-3 flex items-center justify-between border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-xs text-slate-700 tracking-tight">Inivra Whiteboard</span>
                    <div className="flex items-center gap-1.5">
                      {['#4f46e5', '#ec4899', '#10b981', '#f59e0b', '#000000'].map(c => (
                        <button
                          key={c}
                          onClick={() => { setColor(c); setTool('brush'); }}
                          style={{ backgroundColor: c }}
                          className={`w-5 h-5 rounded-full border transition-transform ${color === c && tool === 'brush' ? 'scale-125 border-slate-500' : 'border-transparent'}`}
                        />
                      ))}
                      <button 
                        onClick={() => setTool('eraser')}
                        className={`text-xs px-2 py-1 rounded border transition-colors ${tool === 'eraser' ? 'bg-indigo-600 text-white border-transparent' : 'bg-white hover:bg-slate-50 border-slate-300'}`}
                      >
                        Eraser
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={clearCanvas}
                      className="px-3 py-1 bg-slate-200 hover:bg-slate-300 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Clear Board
                    </button>
                  </div>
                </div>

                <div className="flex-1 relative bg-white">
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={400}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="w-full h-full cursor-crosshair"
                  />
                  <div className="absolute bottom-3 left-3 bg-slate-900 text-white text-[10px] font-mono px-2.5 py-1 rounded-full opacity-70">
                    Whiteboard interactive. Draw inside using your mouse.
                  </div>
                </div>
              </div>
            ) : sharingScreen ? (
              /* Simulated Presentation Screen sharing */
              <div className="absolute inset-0 bg-indigo-950 flex flex-col items-center justify-center p-8 space-y-4 text-center">
                <ScreenShare className="w-16 h-16 text-indigo-400 stroke-1" />
                <div className="space-y-1.5">
                  <h4 className="font-bold text-lg">Presenting AP Physics Exam review slides...</h4>
                  <p className="text-sm text-slate-400 max-w-md font-light leading-relaxed">
                    "Work-energy theorem relates mechanical force integrals directly to translational speed squares. Be ready to solve Workbook Unit 2."
                  </p>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-lg text-xs font-mono border border-indigo-900/50">
                  Screen share active. Click toggle control to terminate.
                </div>
              </div>
            ) : (
              /* Simulated Webcam Stream layout */
              <div className="absolute inset-0 grid grid-cols-2 gap-4 p-4">
                {cameraOn ? (
                  <div className="bg-slate-850 rounded-xl relative overflow-hidden border border-slate-800">
                    <img 
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400" 
                      alt={teacherName} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute bottom-3 left-3 bg-slate-900/80 px-2.5 py-1 rounded text-xs font-mono">
                      Dr. Sarah Jenkins (Host)
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-850 rounded-xl flex items-center justify-center border border-slate-800">
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-lg font-bold">SJ</div>
                      <p className="text-xs text-slate-400 font-mono">Dr. Jenkins (Camera off)</p>
                    </div>
                  </div>
                )}

                <div className="bg-slate-850 rounded-xl relative overflow-hidden border border-slate-800">
                  <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-500 font-mono text-sm">
                    {currentUserName} (You)
                  </div>
                  <div className="absolute bottom-3 left-3 bg-slate-900/80 px-2.5 py-1 rounded text-xs font-mono">
                    {currentUserName}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick interactive floating controls */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex gap-2">
              <button 
                onClick={() => setMicOn(!micOn)}
                className={`p-3 rounded-xl transition-all ${micOn ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-400'}`}
                title={micOn ? "Mute Microphone" : "Unmute Microphone"}
              >
                <Mic className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setCameraOn(!cameraOn)}
                className={`p-3 rounded-xl transition-all ${cameraOn ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-400'}`}
                title={cameraOn ? "Stop Camera" : "Start Camera"}
              >
                <Camera className="w-5 h-5" />
              </button>
              <button 
                onClick={() => { setSharingScreen(!sharingScreen); setWhiteboardMode(false); }}
                className={`p-3 rounded-xl transition-all ${sharingScreen ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-400'}`}
                title="Toggle Screen Sharing"
              >
                <ScreenShare className="w-5 h-5" />
              </button>
              <button 
                onClick={() => { setWhiteboardMode(!whiteboardMode); setSharingScreen(false); }}
                className={`p-3 rounded-xl transition-all ${whiteboardMode ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-400'}`}
                title="Toggle Whiteboard"
              >
                <Layout className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={generateAiMeetingSummary}
                disabled={loadingSummary}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-2 shadow shadow-indigo-600/30 uppercase tracking-wider"
              >
                {loadingSummary ? "Summarizing..." : "AI summarize Class"}
              </button>
            </div>
          </div>

          {/* AI generated Summary view inside Video Conferencing */}
          {aiSummary && (
            <div className="bg-slate-900 border border-indigo-900/40 p-5 rounded-2xl space-y-3 shadow-xl">
              <div className="flex items-center gap-2 text-indigo-400">
                <CheckCircle className="w-5 h-5" />
                <h4 className="font-bold text-sm">Automated AI Classroom summary Draft</h4>
              </div>
              <p className="text-xs text-slate-300 font-light leading-relaxed whitespace-pre-wrap bg-slate-950 p-4 rounded-xl border border-slate-850">
                {aiSummary}
              </p>
            </div>
          )}

        </div>

        {/* Right Side: Attendees list & Classroom Chat log */}
        <div className="border-l border-slate-800 bg-slate-900 flex flex-col h-full overflow-hidden">
          
          {/* Members tab */}
          <div className="p-4 border-b border-slate-800 space-y-3">
            <h3 className="font-bold text-xs tracking-wider uppercase text-slate-400">Attendees ({attendees.length})</h3>
            <div className="space-y-2">
              {attendees.map((att, i) => (
                <div key={i} className="flex items-center justify-between text-xs p-1.5 rounded hover:bg-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-slate-700 font-bold text-[9px] flex items-center justify-center">
                      {att.name.slice(0, 2)}
                    </div>
                    <span className="font-semibold text-slate-250 truncate max-w-[120px]">{att.name}</span>
                  </div>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                    att.role === 'Teacher' ? 'bg-purple-950 text-purple-300' : 'bg-slate-950 text-slate-400'
                  }`}>{att.role}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live class chat log */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-900/60">
              <h3 className="font-bold text-xs tracking-wider uppercase text-slate-400">Class chat logs</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {chatLog.map((c, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-xs text-indigo-400">{c.sender}</span>
                    <span className="text-[8px] text-slate-500 font-mono">{c.time}</span>
                  </div>
                  <p className="text-xs text-slate-300 font-light bg-slate-950/45 p-2 rounded-lg leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSendChat} className="p-4 bg-slate-950 border-t border-slate-800 flex gap-2">
              <input 
                type="text" 
                value={newChatText}
                onChange={e => setNewChatText(e.target.value)}
                placeholder="Talk to everyone..."
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 focus:border-indigo-500 text-xs rounded-lg focus:outline-none"
              />
              <button 
                type="submit"
                className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
