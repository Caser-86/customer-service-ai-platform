'use client';

export function HandoffBanner() {
  return (
    <div className="px-4 py-3 bg-yellow-500/10 border-b border-yellow-500/30">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
        <span className="text-yellow-400 text-sm font-medium">
          正在为您转接人工客服，请稍候...
        </span>
      </div>
    </div>
  );
}
