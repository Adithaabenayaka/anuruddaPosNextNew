"use client";
import { useStudentEnrollmentStore } from "@/stores/useStudentEnrollmentStore";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface StepComponentProps {
  handlePrev: () => void;
  handleNext: () => void;
  handleCancel: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  setIsSubmitted?: React.Dispatch<React.SetStateAction<boolean>>;
  setStepValid: (isValid: boolean) => void;
  isFormValid?: React.RefObject<(() => boolean) | null>;
}

interface StepNavigatorOptions {
  label: string;
  icon: React.ReactNode;
  component: React.ComponentType<StepComponentProps>;
}

interface StepNavigatorProps {
  title: string;
  steps: StepNavigatorOptions[];
  stepBtns?: boolean;
  onCancel?: () => void;
  onSubmit?: () => Promise<void>;
  setIsSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
}

const StepNavigator: React.FC<StepNavigatorProps> = ({
  title,
  steps,
  stepBtns = true,
  onCancel,
  setIsSubmitted,
  // onSubmit,
}) => {
  const savedStep = sessionStorage.getItem("currentStep");
  const initialStep = savedStep ? parseInt(savedStep) : 1;
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [validatedSteps, setValidatedSteps] = useState<Set<number>>(
    new Set([1]),
  ); // Track valid steps
  const [isCurrentStepValid, setIsCurrentStepValid] = useState<boolean>(true);
  const router = useRouter();
  const { isEditing, setIsEditing, resetForm, setCurrentFormStep } =
    useStudentEnrollmentStore();

  useEffect(() => {
    sessionStorage.setItem("currentStep", currentStep.toString());
    window.scrollTo(0, 0);
  }, [currentStep]);

  const handleNext = () => {
    if (isCurrentStepValid && currentStep < steps.length) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setCurrentFormStep(nextStep.toString());
      // setValidatedSteps((prev) => new Set(prev).add(currentStep));
      setValidatedSteps((prev) => {
        const newSet = new Set(prev);
        newSet.add(currentStep);
        if (currentStep === 4) {
          newSet.add(nextStep); // Validate step 5 if step 4 is valid
        }
        return newSet;
      });
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setCurrentFormStep(prevStep.toString());
    }
  };

  const handleCancel = () => {
    setValidatedSteps(new Set([1]));
    setIsEditing(false);
    resetForm();
    sessionStorage.setItem("currentStep", "1");
    router.push("/");
    onCancel?.();
  };

  const goToStep = (step: number) => {
    const validatedStepsCount = validatedSteps.size;
    // Allow navigation to validated steps or previous steps
    if (
      validatedSteps.has(step) ||
      step <= currentStep ||
      isEditing ||
      validatedStepsCount === 5
    ) {
      setCurrentStep(step);
      setCurrentFormStep(step.toString());
    }
  };

  const CurrentComponent = steps[currentStep - 1].component;
  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === steps.length;

  return (
    <>
      <div
        className={`bg-[#2D6C0F] fixed w-full xlg:w-[81%] 2xl:w-[82%] 2xmlg:w-[85%] z-[40] xl:z-[20] -mt-[2px] flex flex-col gap-[20px] p-[24px] pb-[84px] ${currentStep === 5 ? "lg:py-0" : "lg:pb-[24px]"} xl:px-[24px] xl:pt-0 xl:flex-row xl:justify-between xl:items-center font-plus-sans`}
      >
        {stepBtns && currentStep !== 5 && (
          <>
            <h1 className="text-[18px]/[24px] xl:text-[1.125rem] 2xl:text-2xl font-bold text-white text-left">
              {title}
            </h1>
            <div className="relative flex items-center justify-between w-full max-w-[710px] lg:hidden mx-auto">
              <div className="absolute top-1/2 h-[3px] w-full border-t-2 border-dashed border-[#3A8B13] -translate-y-1/2" />
              <div
                className="absolute top-1/2 h-[2px] bg-white transition-all duration-500 -translate-y-1/2"
                style={{ width: `${progressPercentage}%` }}
              />
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`relative w-[40px] h-[40px] rounded-full flex items-center justify-center border-[3px] cursor-pointer ${
                    currentStep >= index + 1
                      ? "border-[#2D6C0F] text-[#22520B] bg-white"
                      : "border-[#2D6C0F] text-[#3A8B13] bg-[#22520B]"
                  }`}
                  onClick={() => goToStep(index + 1)}
                >
                  {step.icon}
                  <div className="absolute mt-[96px] text-center text-white text-base font-medium">
                    {step.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden relative lg:flex flex-col items-center w-full md:mx-auto xl:mx-0 2xl:mx-6 2xmlg:mx-14 xmlg:mx-8 xxl:mx-3 max-w-[740px]">
              <div className="absolute max-w-[584px] top-[20px] left-[73px] right-[73px]">
                <div className="h-[3px] border-t-2 border-dashed border-[#3A8B13] relative z-0" />
                <div
                  className="absolute top-0 left-0 h-[2px] bg-white transition-all duration-500 z-10"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              {/* Step Icons and Labels */}
              <div className="relative z-20 flex items-center justify-between w-full 2xl:w-full">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center md:min-w-[146px] lg:min-w-[120px] 2xl:min-w-[120px] group"
                    onClick={() => goToStep(index + 1)}
                  >
                    <div
                      className={`w-[40px] h-[40px] rounded-full flex items-center justify-center border-[3px]
                        ${
                          currentStep >= index + 1
                            ? "border-[#2D6C0F] text-[#22520B]  cursor-pointer bg-white group-hover:bg-white/90"
                            : `border-[#2D6C0F] text-[#3A8B13] bg-[#22520B] group-hover:bg-[#22520B]/70 ${isEditing ? "cursor-pointer" : "cursor-not-allowed"}`
                        }`}
                    >
                      {step.icon}
                    </div>
                    <div className="mt-[12px] text-center text-base xl:text-[0.75rem] text-[#FFFFFF] 2xl:text-base font-medium 2xl:text-nowrap group-hover:text-white/90">
                      {step.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div
        className={`py-[24px] ${currentStep === 5 ? "xl:pt-6" : "pt-54 lg:pt-48 lg:pb-6 xl:pt-[120px]"} xl:pb-8 bg-background-custom px-[16px] xl:px-[24px]`}
      >
        <CurrentComponent
          handleNext={handleNext}
          handlePrev={handlePrev}
          handleCancel={handleCancel}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          setIsSubmitted={setIsSubmitted}
          setStepValid={setIsCurrentStepValid}
        />
      </div>
    </>
  );
};

export default StepNavigator;
