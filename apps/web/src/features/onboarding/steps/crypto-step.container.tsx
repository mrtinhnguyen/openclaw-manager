import { CryptoStep } from "@/components/crypto-step";
import { useCryptoStore } from "@/stores/crypto-store";
import { useJobsStore } from "@/stores/jobs-store";
import { jobsManager } from "@/managers/jobs-manager";
import { statusManager } from "@/managers/status-manager";
import { useEffect } from "react";

export function CryptoStepContainer() {
  const store = useCryptoStore();
  const installJob = useJobsStore((state) => state.cryptoSkills);

  const handleNext = async () => {
    // If skills are selected, trigger install job
    if (store.skills.length > 0) {
      await jobsManager.startCryptoSkillInstallJob(store.skills);
    }
    
    // Mark as configured regardless of installation (it happens in background or we wait? 
    // Let's wait for simple flow, or just proceed. The user can see logs if we added a logs view)
    // For now, let's proceed immediately as installation might take time, 
    // BUT usually we want to block or show a "Installing..." state.
    // Let's keep it simple: fire and forget for now, but mark configured.
    // Ideally we should wait if it's critical.
    
    store.setConfigured(true);
    statusManager.refresh();
  };
  
  // Watch for job completion if we wanted to block
  useEffect(() => {
    if (installJob.status === "success" || installJob.status === "failed") {
        // Could show toast or notification
    }
  }, [installJob.status]);

  return (
    <CryptoStep
      chain={store.chain}
      rpcUrl={store.rpcUrl}
      walletAddress={store.walletAddress}
      isTestnet={store.isTestnet}
      skills={store.skills}
      installStatus={installJob.status}
      onChainChange={store.setChain}
      onRpcUrlChange={store.setRpcUrl}
      onWalletAddressChange={store.setWalletAddress}
      onTestnetChange={store.setTestnet}
      onToggleSkill={store.toggleSkill}
      onNext={handleNext}
    />
  );
}

