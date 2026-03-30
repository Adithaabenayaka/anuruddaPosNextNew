"use client";
import { usePaymentDetailsStore } from "@/stores/UsePaymentDetailsStore";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import ConfirmButton from "../form/formButton/ConfirmButton";
import CancelButton from "../form/formButton/CancelButton";

interface PaymentComponentProps {
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

interface PaymentNavigatorOptions {
  label: string;
  component: React.ComponentType<PaymentComponentProps>;
}

interface StepNavigatorProps {
  //   title/: string;
  steps: PaymentNavigatorOptions[];
  stepBtns?: boolean;
  onCancel?: () => void;
  onSubmit?: () => Promise<void>;
  setIsSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
}

const PaymentNavigator: React.FC<StepNavigatorProps> = ({
  steps,
  onCancel,
  setIsSubmitted,
}) => {
  const savedStep = localStorage.getItem("currentStep");
  const initialStep = savedStep ? parseInt(savedStep) : 1;
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [isOpen, setisOpen] = useState(false);

  // Track valid steps
  const [isCurrentStepValid, setIsCurrentStepValid] = useState<boolean>(true);
  const router = useRouter();
  const { setIsEditing, resetForm, setCurrentFormStep } =
    usePaymentDetailsStore();

  useEffect(() => {
    localStorage.setItem("currentStep", currentStep.toString());
    window.scrollTo(0, 0);
  }, [currentStep]);

  const handleNext = () => {
    if (isCurrentStepValid && currentStep < steps.length) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setCurrentFormStep(nextStep.toString());
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
    setisOpen(true);
  };

  const cancelProcess = () => {
    setIsEditing(false);
    resetForm();
    localStorage.setItem("currentStep", "1");
    router.push("/payment/paymentOverview");
    onCancel?.();
  };

  const CurrentComponent = steps[currentStep - 1].component;
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === steps.length;

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
      document.documentElement.classList.add("overflow-hidden");
      document.body.style.overflowY = "hidden";
    } else {
      document.body.classList.remove("overflow-hidden");
      document.documentElement.classList.remove("overflow-hidden");
      document.body.style.overflowY = "";
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
      document.documentElement.classList.remove("overflow-hidden");
      document.body.style.overflowY = "";
    };
  }, [isOpen]);

  return (
    <>
      <div>
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

      {isOpen && (
        <div className="h-full bg-black/90 backdrop-blur-xs fixed inset-0 z-[1000] flex items-center justify-center px-6">
          <div className="w-full py-[64.5px] px-6 flex flex-col gap-8 items-center justify-center bg-white rounded-[0.5rem] max-w-[604px] lg:max-w-[760px]">
            <div className="lg:w-10 xl:w-auto">
              <Image
                width={67}
                height={67}
                src="/images/application/closed.png"
                alt="Logo"
                className="aspect-square"
              />
            </div>
            <div>
              <h1 className="text-[#1A1A1A] text-[1.125rem] lg:text-[1.25rem] font-bold text-center h-6">
                Do you want cancel this process?
              </h1>
            </div>
            <div className="flex flex-row-reverse gap-6">
              <ConfirmButton title="Yes" onClick={() => cancelProcess()} />
              <CancelButton title="No" onClick={() => setisOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentNavigator;
