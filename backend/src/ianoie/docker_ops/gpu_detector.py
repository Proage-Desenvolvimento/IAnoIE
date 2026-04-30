import pynvml


class GPUDetector:
    def __init__(self):
        pynvml.nvmlInit()

    def get_gpu_count(self) -> int:
        return pynvml.nvmlDeviceGetCount()

    def get_gpu_info(self, index: int) -> dict:
        handle = pynvml.nvmlDeviceGetHandleByIndex(index)
        util = pynvml.nvmlDeviceGetUtilizationRates(handle)
        mem = pynvml.nvmlDeviceGetMemoryInfo(handle)
        temp = pynvml.nvmlDeviceGetTemperature(handle, pynvml.NVML_TEMPERATURE_GPU)
        power = pynvml.nvmlDeviceGetPowerUsage(handle)
        uuid = pynvml.nvmlDeviceGetUUID(handle)
        name = pynvml.nvmlDeviceGetName(handle)

        return {
            "index": index,
            "uuid": uuid.decode() if isinstance(uuid, bytes) else uuid,
            "name": name.decode() if isinstance(name, bytes) else name,
            "utilization_gpu": util.gpu,
            "utilization_memory": util.memory,
            "vram_used_mb": mem.used / (1024 * 1024),
            "vram_total_mb": mem.total / (1024 * 1024),
            "vram_free_mb": mem.free / (1024 * 1024),
            "temperature": temp,
            "power_usage_w": power / 1000.0,
        }

    def get_all_gpus(self) -> list[dict]:
        return [self.get_gpu_info(i) for i in range(self.get_gpu_count())]

    def get_gpu_uuid(self, index: int) -> str:
        handle = pynvml.nvmlDeviceGetHandleByIndex(index)
        uuid = pynvml.nvmlDeviceGetUUID(handle)
        return uuid.decode() if isinstance(uuid, bytes) else uuid

    def __del__(self):
        try:
            pynvml.nvmlShutdown()
        except Exception:
            pass
