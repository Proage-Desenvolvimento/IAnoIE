import logging

logger = logging.getLogger(__name__)

_pynvml_available = False
try:
    import pynvml
    _pynvml_available = True
except Exception:
    pass


class GPUDetector:
    def __init__(self):
        self._available = False
        if _pynvml_available:
            try:
                pynvml.nvmlInit()
                self._available = True
            except Exception:
                logger.debug("NVIDIA NVML not available — GPU features disabled")

    @property
    def available(self) -> bool:
        return self._available

    def get_gpu_count(self) -> int:
        if not self._available:
            return 0
        return pynvml.nvmlDeviceGetCount()

    def get_gpu_info(self, index: int) -> dict:
        if not self._available:
            return {}
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
        if not self._available:
            return []
        return [self.get_gpu_info(i) for i in range(self.get_gpu_count())]

    def get_gpu_uuid(self, index: int) -> str:
        if not self._available:
            return ""
        handle = pynvml.nvmlDeviceGetHandleByIndex(index)
        uuid = pynvml.nvmlDeviceGetUUID(handle)
        return uuid.decode() if isinstance(uuid, bytes) else uuid

    def __del__(self):
        if self._available:
            try:
                pynvml.nvmlShutdown()
            except Exception:
                pass
