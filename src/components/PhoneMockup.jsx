import { motion, AnimatePresence } from 'framer-motion';

export default function PhoneMockup({ children, className = '', overlay = null }) {
  return (
    <div className={`relative mx-auto select-none ${className}`} style={{ width: '260px' }}>
      {/* Phone outer body */}
      <div
        className="relative rounded-[44px] p-[10px] phone-shadow"
        style={{
          background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
          border: '2px solid #3a3a3a',
        }}
      >
        {/* Side buttons - left */}
        <div className="absolute left-[-3px] top-[88px] w-[3px] h-[28px] rounded-r-sm" style={{ background: '#333' }} />
        <div className="absolute left-[-3px] top-[124px] w-[3px] h-[44px] rounded-r-sm" style={{ background: '#333' }} />
        <div className="absolute left-[-3px] top-[176px] w-[3px] h-[44px] rounded-r-sm" style={{ background: '#333' }} />
        {/* Side button - right */}
        <div className="absolute right-[-3px] top-[116px] w-[3px] h-[64px] rounded-l-sm" style={{ background: '#333' }} />

        {/* Screen bezel */}
        <div
          className="rounded-[36px] overflow-hidden bg-black"
          style={{ height: '520px' }}
        >
          {/* Status bar */}
          <div className="bg-black flex items-center justify-between px-5 pt-2 pb-1" style={{ height: '28px' }}>
            <span className="text-white text-[10px] font-semibold">9:41</span>
            <div className="flex items-center gap-1">
              <div className="flex gap-0.5 items-end h-3">
                <div className="w-[3px] bg-white rounded-sm" style={{ height: '40%' }} />
                <div className="w-[3px] bg-white rounded-sm" style={{ height: '60%' }} />
                <div className="w-[3px] bg-white rounded-sm" style={{ height: '80%' }} />
                <div className="w-[3px] bg-white rounded-sm" style={{ height: '100%' }} />
              </div>
              <svg width="14" height="10" viewBox="0 0 14 10" className="text-white fill-current ml-0.5">
                <path d="M7 2.23L9.75 5l1.5-1.5L7 0 2.75 3.5 4.25 5 7 2.23zM7 7.77L4.25 5l-1.5 1.5L7 10l4.25-3.5L9.75 5 7 7.77z" />
              </svg>
              {/* Battery */}
              <div className="flex items-center ml-0.5">
                <div className="w-5 h-2.5 rounded-sm border border-white flex items-center justify-start px-[2px]">
                  <div className="h-1.5 w-3 rounded-sm bg-white" />
                </div>
                <div className="w-[2px] h-1.5 rounded-r-sm bg-white ml-px" />
              </div>
            </div>
          </div>

          {/* Dynamic Island / Notch */}
          <div className="bg-black flex justify-center pb-1">
            <div className="w-24 h-[22px] bg-black rounded-b-2xl flex items-center justify-center">
              <div className="w-16 h-4 rounded-full bg-[#1a1a1a]" />
            </div>
          </div>

          {/* App content */}
          <div className="relative" style={{ height: '470px' }}>
            <div className="overflow-y-auto bg-white h-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key="content"
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className="h-full"
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
            {/* Non-scrolling overlay layer */}
            {overlay && (
              <div className="absolute inset-0 pointer-events-none">
                {overlay}
              </div>
            )}
          </div>
        </div>

        {/* Home indicator */}
        <div className="flex justify-center mt-1.5">
          <div className="w-24 h-1 rounded-full bg-white/30" />
        </div>
      </div>

      {/* Reflection */}
      <div
        className="absolute inset-0 rounded-[44px] pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)',
        }}
      />
    </div>
  );
}
