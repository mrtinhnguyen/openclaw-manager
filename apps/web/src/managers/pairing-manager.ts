import { usePairingStore } from "@/stores/pairing-store";
import { useProbeStore } from "@/stores/probe-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { runProbeAfterPairing } from "./probe-manager";
import { jobsManager } from "./jobs-manager";

export class PairingManager {
  setValue = (value: string) => usePairingStore.getState().setValue(value);
  setMessage = (value: string | null) => usePairingStore.getState().setMessage(value);
  setIsProcessing = (value: boolean) => usePairingStore.getState().setIsProcessing(value);

  submit = async () => {
    const pairing = usePairingStore.getState();
    const code = pairing.value.trim();
    if (!code) return;
    pairing.setIsProcessing(true);
    pairing.setMessage(null);
    useProbeStore.getState().setMessage(null);
    const result = await jobsManager.startPairingJob(code);
    if (result.ok) {
      pairing.setValue("");
      pairing.setMessage("配对成功，准备进入通道探测...");
      useOnboardingStore.getState().setEvents({ pairingConfirmed: true });
      await runProbeAfterPairing();
    } else {
      pairing.setMessage(`配对失败: ${result.error}`);
    }
    pairing.setIsProcessing(false);
  };
}
