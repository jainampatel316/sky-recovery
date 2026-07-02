import { useState } from 'react';
import { Joyride, STATUS, EVENTS } from 'react-joyride';
import type { TooltipRenderProps } from 'react-joyride';
import { useTheme } from 'next-themes';
import { X } from 'lucide-react';

function CustomTooltip({
  index,
  isLastStep,
  step,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
}: TooltipRenderProps) {
  return (
    <div
      {...tooltipProps}
      className="bg-white dark:bg-black text-zinc-900 dark:text-white max-w-[340px] rounded-2xl p-5 shadow-2xl border border-zinc-200 dark:border-zinc-800 relative"
    >
      <button 
        {...closeProps}
        className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
      >
        <X size={18} />
      </button>

      {step.title && (
        <h3 className="font-semibold text-lg mb-2 pr-6 tracking-tight">
          {step.title}
        </h3>
      )}
      
      <div className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">
        {step.content}
      </div>

      <div className="flex items-center justify-end gap-4">
        {index > 0 && (
          <button {...backProps} className="text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
            Back
          </button>
        )}
        <button 
          {...primaryProps} 
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-md transition-all active:scale-95"
        >
          {isLastStep ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
}

interface JourneyTourProps {
  run: boolean;
  onFinish: () => void;
}

export function JourneyTour({ run, onFinish }: JourneyTourProps) {
  const { theme, systemTheme } = useTheme();
  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDark = currentTheme === 'dark';
  // Use exact hex for Tailwind black or white to match arrow
  const bgColor = isDark ? '#000000' : '#ffffff';

  const steps: any[] = [
    {
      target: '.tour-flight-card',
      title: 'Real-time Disruption Detection',
      content: 'Your flight has been cancelled. Our system instantly detects the disruption and begins working on a solution before you even reach the counter.',
      disableBeacon: true,
      placement: 'left',
    },
    {
      target: '.tour-timeline',
      title: 'Smart Recovery Timeline',
      content: 'Track the status of your recovery in real-time. Our AI engine is analyzing alternate routes based on your loyalty tier, connections, and airline policies.',
      placement: 'left',
    },
    {
      target: '.tour-recovery-panel',
      title: 'AI-Powered Rebooking',
      content: 'Here is your personalized, optimal recovery plan. You can accept this immediately right from your phone without waiting in long customer service lines.',
      placement: 'left',
    },
    {
      target: '.tour-vouchers',
      title: 'Automated Compensation',
      content: 'Eligible vouchers for meals or hotels are automatically generated and ready to use based on your specific delay length and policy entitlements.',
      placement: 'right',
    },
    {
      target: '.tour-chat-widget',
      title: '24/7 AI Agent',
      content: 'Still have questions? Chat with our specialized AI agent at any time to check refund eligibility, request special assistance, or ask about your new flight details.',
      placement: 'left-end',
    },
    {
      target: '.tour-nav-notifications',
      title: 'Real-time Notifications',
      content: 'Any updates about your rebooked flights, hotel vouchers, or compensation payouts will appear instantly here so you never miss a beat.',
      placement: 'right',
    },
    {
      target: '.tour-nav-history',
      title: 'Recovery History',
      content: 'Track past disruptions, review the compensation you received, and download records for any previous flights we have recovered for you.',
      placement: 'right',
    },
    {
      target: '.tour-nav-demo',
      title: 'Scenario Control',
      content: 'Use this panel to reset your passenger data or simulate new disruptions for demonstration purposes.',
      placement: 'right',
    }
  ];

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    
    if (finishedStatuses.includes(status)) {
      onFinish();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep
      showProgress={false}
      showSkipButton={false}
      callback={handleJoyrideCallback}
      tooltipComponent={CustomTooltip}
      styles={{
        // @ts-ignore: react-joyride styles type doesn't strictly include options but it is supported
        options: {
          arrowColor: bgColor,
          zIndex: 1000,
        }
      }}
    />
  );
}
