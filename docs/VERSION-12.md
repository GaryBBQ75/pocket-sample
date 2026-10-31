# Pocket Sample 12 — temporal-rack warmup

The temporal processor now starts warming its rolling buffer at the first user-initiated audio use, with roughly 4 MB of fixed stereo ring storage and no microphone access. Non-gate temporal effects wait for enough history to avoid a silent capture when first activated. The original signal remains audible during warmup. Restored temporal settings are re-armed when transport starts. Version 11's feature coverage and limitations still apply.
