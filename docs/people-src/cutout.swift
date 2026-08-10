// cutout.swift — macOS Vision 去背單檔工具
// 用法： swift cutout.swift <輸入圖> <輸出png>
// 用 VNGenerateForegroundInstanceMaskRequest 抽前景人物 → 輸出帶 alpha 的 PNG。
// 需 macOS 14+。之後加新講師照抄此流程（見 docs/point-cloud-effect.md §7.4）。
import Foundation
import Vision
import CoreImage
import AppKit

guard CommandLine.arguments.count >= 3 else {
    FileHandle.standardError.write("usage: swift cutout.swift <input> <output.png>\n".data(using: .utf8)!)
    exit(2)
}
let inPath = CommandLine.arguments[1]
let outPath = CommandLine.arguments[2]

guard let nsImage = NSImage(contentsOfFile: inPath),
      let tiff = nsImage.tiffRepresentation,
      let bitmap = NSBitmapImageRep(data: tiff),
      let cgImage = bitmap.cgImage else {
    FileHandle.standardError.write("cannot load image: \(inPath)\n".data(using: .utf8)!)
    exit(1)
}

let ciContext = CIContext()
let request = VNGenerateForegroundInstanceMaskRequest()
let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])

do {
    try handler.perform([request])
    guard let result = request.results?.first else {
        FileHandle.standardError.write("no foreground instances found\n".data(using: .utf8)!)
        exit(1)
    }
    // 產生所有前景實例的遮罩並套用（croppedToInstancesExtent: false 保持原尺寸）
    let masked = try result.generateMaskedImage(
        ofInstances: result.allInstances,
        from: handler,
        croppedToInstancesExtent: false)
    let ciImage = CIImage(cvPixelBuffer: masked)
    guard let out = ciContext.createCGImage(ciImage, from: ciImage.extent) else {
        FileHandle.standardError.write("cannot render masked image\n".data(using: .utf8)!)
        exit(1)
    }
    let rep = NSBitmapImageRep(cgImage: out)
    guard let png = rep.representation(using: .png, properties: [:]) else {
        FileHandle.standardError.write("cannot encode png\n".data(using: .utf8)!)
        exit(1)
    }
    try png.write(to: URL(fileURLWithPath: outPath))
    print("wrote \(outPath) (\(out.width)x\(out.height))")
} catch {
    FileHandle.standardError.write("vision error: \(error)\n".data(using: .utf8)!)
    exit(1)
}
