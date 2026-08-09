import { Check } from 'lucide-react';

export default function OnboardingProgress({
    current,
}: {
    current: 1 | 2 | 3;
}) {
    const steps = ['Business details', 'Location & hours', 'Review'];

    return (
        <div className="mb-8">
            <p className="mb-3 text-center text-xs font-bold text-[#64736f] dark:text-[#9fb2ad]">
                Step {current} of 3
            </p>
            <div className="mx-auto flex max-w-2xl items-start">
                {steps.map((step, index) => {
                    const number = index + 1;
                    const done = number < current;
                    const active = number === current;

                    return (
                        <div
                            key={step}
                            className="flex flex-1 items-start last:flex-none"
                        >
                            <div className="flex flex-col items-center gap-2">
                                <span
                                    className={`grid size-8 place-items-center rounded-full text-xs font-extrabold ${done || active ? 'bg-[#0f766e] text-white' : 'border border-[#cddbd7] bg-white text-[#64736f] dark:border-[#2d4942] dark:bg-[#172a26]'}`}
                                >
                                    {done ? (
                                        <Check className="size-4" />
                                    ) : (
                                        number
                                    )}
                                </span>
                                <span
                                    className={`w-24 text-center text-[10px] font-semibold ${active ? 'text-[#0f766e] dark:text-[#5eead4]' : 'text-[#64736f] dark:text-[#9fb2ad]'}`}
                                >
                                    {step}
                                </span>
                            </div>
                            {number < 3 && (
                                <div
                                    className={`mt-4 h-0.5 flex-1 ${done ? 'bg-[#0f766e]' : 'bg-[#dde7e3] dark:bg-[#2d4942]'}`}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
