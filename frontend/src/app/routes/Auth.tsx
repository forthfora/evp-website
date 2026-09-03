import { AnimatePresence, motion } from 'framer-motion';

import { PageMeta } from '@/components/ui';
import { CodeStep, EmailStep, NamesStep, stepVariants, useAuthFlow } from '@/features/auth';

export default function Auth() {
	const flow = useAuthFlow();
	const playIntro = !flow.hasNavigated;

	return (
		<div className="flex w-full items-center justify-center overflow-hidden px-4 pt-35">
			<PageMeta
				title="Join EVP"
				description="Become a member of EVP, the premier VC society at the University of Edinburgh."
			/>
			<AnimatePresence mode="wait" custom={flow.direction}>
				<motion.div
					key={flow.step}
					custom={flow.direction}
					variants={stepVariants}
					initial={playIntro ? false : 'enter'}
					animate="center"
					exit="exit"
					transition={{ duration: 0.35, ease: 'easeInOut' }}
					className="w-full"
				>
					{flow.step === 'email' && (
						<EmailStep
							email={flow.email.value}
							onEmailChange={flow.email.set}
							onSubmit={flow.handleSendCode}
							isSubmitting={flow.isSendingCode}
							error={flow.error}
							playIntro={playIntro}
						/>
					)}

					{flow.step === 'code' && (
						<CodeStep
							email={flow.email.value}
							codeDigits={flow.codeDigits}
							inputRefs={flow.inputRefs}
							onDigitChange={flow.handleDigitChange}
							onDigitKeyDown={flow.handleDigitKeyDown}
							onDigitPaste={flow.handleDigitPaste}
							onVerify={flow.handleVerify}
							onResend={flow.handleResendCode}
							onBack={flow.handleBackToEmail}
							isVerifying={flow.isVerifying}
							isResending={flow.isSendingCode}
							error={flow.error}
						/>
					)}

					{flow.step === 'names' && (
						<NamesStep
							firstName={flow.names.first}
							onFirstNameChange={flow.names.setFirst}
							lastName={flow.names.last}
							onLastNameChange={flow.names.setLast}
							onSubmit={flow.handleSubmitNames}
							isSubmitting={flow.isSavingNames}
							error={flow.error}
						/>
					)}
				</motion.div>
			</AnimatePresence>
		</div>
	);
}
