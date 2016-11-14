// In-place radix-2 decimation in time FFT
// Based on C++ FFT from Uwe Simmer

function fft(real, imag, nfft) {

    if (Math.log2(nfft) == 0) {
        throw "number of FFT bins must be a power of two";
    }

    if (real.length != imag.length) {
        throw "Mismatched lengths";
    }

      transform

}
