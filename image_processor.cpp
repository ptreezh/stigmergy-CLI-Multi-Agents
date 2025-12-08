/**
 * @file image_processor.cpp
 * @brief Image processing functions for computer vision applications
 * @author iFlow CLI
 * @date 2025-12-08
 */

#include <vector>
#include <memory>
#include <stdexcept>
#include <algorithm>
#include <cmath>

/**
 * @brief Structure representing RGB pixel data
 * @details Contains red, green, and blue color channels (0-255 range)
 */
struct Pixel {
    uint8_t r;  ///< Red color channel (0-255)
    uint8_t g;  ///< Green color channel (0-255)
    uint8_t b;  ///< Blue color channel (0-255)
    
    /**
     * @brief Default constructor initializing pixel to black
     */
    Pixel() : r(0), g(0), b(0) {}
    
    /**
     * @brief Constructor with specific color values
     * @param red Red channel value (0-255)
     * @param green Green channel value (0-255)
     * @param blue Blue channel value (0-255)
     */
    Pixel(uint8_t red, uint8_t green, uint8_t blue) : r(red), g(green), b(blue) {}
};

/**
 * @brief Applies Gaussian blur filter to input image
 * @details Implements 2D Gaussian convolution with configurable kernel size
 *          Uses separable convolution for performance optimization
 * 
 * @param imageData Input image data as 2D vector of Pixel structures
 * @param width Image width in pixels
 * @param height Image height in pixels
 * @param kernelSize Size of Gaussian kernel (must be odd, >= 3)
 * @param sigma Standard deviation for Gaussian distribution (default: 1.0)
 * 
 * @return std::vector<std::vector<Pixel>> Processed image with Gaussian blur applied
 * 
 * @throws std::invalid_argument if kernelSize is even or less than 3
 * @throws std::runtime_error if memory allocation fails for large images
 * 
 * @note Time complexity: O(width * height * kernelSize)
 * @note Space complexity: O(width * height)
 * 
 * @warning This function modifies pixel values and may reduce image sharpness
 * @see Pixel struct for color representation
 * @see applyBoxBlur() for simpler blur implementation
 * 
 * @example
 * std::vector<std::vector<Pixel>> image = loadImage("input.jpg");
 * auto blurred = applyGaussianBlur(image, 800, 600, 5, 1.5);
 * saveImage(blurred, "output.jpg");
 */
std::vector<std::vector<Pixel>> applyGaussianBlur(
    const std::vector<std::vector<Pixel>>& imageData,
    int width,
    int height,
    int kernelSize,
    double sigma = 1.0
) {
    // Input validation
    if (kernelSize < 3 || kernelSize % 2 == 0) {
        throw std::invalid_argument("Kernel size must be odd and >= 3");
    }
    
    if (width <= 0 || height <= 0) {
        throw std::invalid_argument("Image dimensions must be positive");
    }
    
    if (imageData.empty() || imageData[0].empty()) {
        throw std::invalid_argument("Image data cannot be empty");
    }
    
    // Create Gaussian kernel
    std::vector<double> kernel(kernelSize);
    double sum = 0.0;
    int center = kernelSize / 2;
    
    // Generate 1D Gaussian kernel values
    for (int i = 0; i < kernelSize; ++i) {
        double x = i - center;
        kernel[i] = std::exp(-(x * x) / (2.0 * sigma * sigma));
        sum += kernel[i];
    }
    
    // Normalize kernel to ensure sum equals 1.0
    for (double& value : kernel) {
        value /= sum;
    }
    
    // Create output image
    std::vector<std::vector<Pixel>> result(height, std::vector<Pixel>(width));
    
    // Apply horizontal convolution first (separable approach)
    std::vector<std::vector<Pixel>> temp(height, std::vector<Pixel>(width));
    
    for (int y = 0; y < height; ++y) {
        for (int x = 0; x < width; ++x) {
            double r = 0.0, g = 0.0, b = 0.0;
            
            // Convolve with horizontal kernel
            for (int k = 0; k < kernelSize; ++k) {
                int sampleX = std::max(0, std::min(width - 1, x + k - center));
                const Pixel& pixel = imageData[y][sampleX];
                
                r += pixel.r * kernel[k];
                g += pixel.g * kernel[k];
                b += pixel.b * kernel[k];
            }
            
            // Clamp values to valid range [0, 255]
            temp[y][x].r = static_cast<uint8_t>(std::max(0.0, std::min(255.0, r)));
            temp[y][x].g = static_cast<uint8_t>(std::max(0.0, std::min(255.0, g)));
            temp[y][x].b = static_cast<uint8_t>(std::max(0.0, std::min(255.0, b)));
        }
    }
    
    // Apply vertical convolution
    for (int y = 0; y < height; ++y) {
        for (int x = 0; x < width; ++x) {
            double r = 0.0, g = 0.0, b = 0.0;
            
            // Convolve with vertical kernel
            for (int k = 0; k < kernelSize; ++k) {
                int sampleY = std::max(0, std::min(height - 1, y + k - center));
                const Pixel& pixel = temp[sampleY][x];
                
                r += pixel.r * kernel[k];
                g += pixel.g * kernel[k];
                b += pixel.b * kernel[k];
            }
            
            // Clamp final values
            result[y][x].r = static_cast<uint8_t>(std::max(0.0, std::min(255.0, r)));
            result[y][x].g = static_cast<uint8_t>(std::max(0.0, std::min(255.0, g)));
            result[y][x].b = static_cast<uint8_t>(std::max(0.0, std::min(255.0, b)));
        }
    }
    
    return result;
}

/**
 * @brief Helper function to calculate Gaussian function value
 * @private
 * @param x Input value
 * @param sigma Standard deviation
 * @return double Gaussian function result
 */
static double gaussianFunction(double x, double sigma) {
    return std::exp(-(x * x) / (2.0 * sigma * sigma));
}