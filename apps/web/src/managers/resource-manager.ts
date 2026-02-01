import { useResourceStore } from "@/stores/resource-store";

import { jobsManager } from "./jobs-manager";
export class ResourceManager {
  setMessage = (value: string | null) => useResourceStore.getState().setMessage(value);

  download = async () => {
    const resource = useResourceStore.getState();
    resource.setMessage("正在下载资源...");
    const result = await jobsManager.startResourceDownloadJob();
    if (result.ok) {
      resource.setMessage("资源下载完成。");
    } else {
      resource.setMessage(`下载失败: ${result.error}`);
    }
    return result;
  };
}
