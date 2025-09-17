'use client';

import { useState } from 'react';
import Image from 'next/image';

interface TryOnResponse {
  success: boolean;
  output?: string[];
  error?: string;
  prediction_id?: string;
}

export default function Home() {
  const [topGarmentUrl, setTopGarmentUrl] = useState('');
  const [bottomGarmentUrl, setBottomGarmentUrl] = useState('');
  const [modelUrl, setModelUrl] = useState('');
  const [finalResultUrl, setFinalResultUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [error, setError] = useState('');

  const callTryOnAPI = async (modelImage: string, garmentImage: string, retryCount = 0): Promise<string> => {
    try {
      const response = await fetch('/api/tryon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model_image: modelImage,
          garment_image: garmentImage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API call failed');
      }

      const data: TryOnResponse = await response.json();
      
      if (!data.success || !data.output || data.output.length === 0) {
        throw new Error('No output received from API');
      }

      return data.output[0];
    } catch (error) {
      // 如果是图片加载错误且是第一次重试，等待更长时间后重试
      if (retryCount < 1 && error instanceof Error && 
          error.message.includes('Failed to load garment image')) {
        console.log('Retrying API call after image load error...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        return callTryOnAPI(modelImage, garmentImage, retryCount + 1);
      }
      throw error;
    }
  };

  const handleGenerate = async () => {
    if (!modelUrl) {
      setError('请输入模特图片URL');
      return;
    }

    if (!topGarmentUrl && !bottomGarmentUrl) {
      setError('请至少输入一个服装图片URL（上装或下装）');
      return;
    }

    setIsLoading(true);
    setError('');
    setFinalResultUrl('');

    try {
      // 根据用户输入决定处理流程
      if (topGarmentUrl && bottomGarmentUrl) {
        // 两件都有：先换上装，再换下装
        setCurrentStep('第一步：正在将上装应用到模特身上...');
        const intermediateResultUrl = await callTryOnAPI(modelUrl, topGarmentUrl);
        
        setCurrentStep('等待中间结果图片加载完成...');
        // 等待一段时间确保图片在CDN上可访问
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        setCurrentStep('第二步：正在将下装应用到中间结果...');
        const finalUrl = await callTryOnAPI(intermediateResultUrl, bottomGarmentUrl);
        
        setFinalResultUrl(finalUrl);
        setCurrentStep('完成！两件服装都已应用');
      } else if (topGarmentUrl) {
        // 只有上装
        setCurrentStep('正在将上装应用到模特身上...');
        const finalUrl = await callTryOnAPI(modelUrl, topGarmentUrl);
        
        setFinalResultUrl(finalUrl);
        setCurrentStep('完成！上装已应用');
      } else if (bottomGarmentUrl) {
        // 只有下装
        setCurrentStep('正在将下装应用到模特身上...');
        const finalUrl = await callTryOnAPI(modelUrl, bottomGarmentUrl);
        
        setFinalResultUrl(finalUrl);
        setCurrentStep('完成！下装已应用');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
      setCurrentStep('');
    } finally {
      setIsLoading(false);
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const downloadImage = async (imageUrl: string) => {
    try {
      setCurrentStep('正在准备下载...');
      
      // Fetch the image
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }
      
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.download = `ai-fashion-tryon-${timestamp}.png`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setCurrentStep('下载完成！');
      setTimeout(() => setCurrentStep(''), 2000);
    } catch (error) {
      console.error('Download failed:', error);
      setError('下载失败，请重试或右键保存图片');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          AI Fashion Virtual Try On
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Garment Inputs */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">服装输入</h2>
            <p className="text-sm text-gray-500 mb-6">
              💡 可以单独输入上装或下装，也可以两者都输入
            </p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  上装图片 URL <span className="text-gray-400">（可选）</span>
                </label>
                <input
                  type="url"
                  value={topGarmentUrl}
                  onChange={(e) => setTopGarmentUrl(e.target.value)}
                  placeholder="https://example.com/top-garment.jpg"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
                {topGarmentUrl && isValidUrl(topGarmentUrl) && (
                  <div className="mt-3">
                    <img
                      src={topGarmentUrl}
                      alt="Top garment preview"
                      className="w-full max-h-48 object-contain rounded-lg border bg-gray-50"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  下装图片 URL <span className="text-gray-400">（可选）</span>
                </label>
                <input
                  type="url"
                  value={bottomGarmentUrl}
                  onChange={(e) => setBottomGarmentUrl(e.target.value)}
                  placeholder="https://example.com/bottom-garment.jpg"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
                {bottomGarmentUrl && isValidUrl(bottomGarmentUrl) && (
                  <div className="mt-3">
                    <img
                      src={bottomGarmentUrl}
                      alt="Bottom garment preview"
                      className="w-full max-h-48 object-contain rounded-lg border bg-gray-50"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Middle Column - Model Input */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">模特输入</h2>
            
            <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  模特图片 URL <span className="text-red-400">（必填）</span>
                </label>
              <input
                type="url"
                value={modelUrl}
                onChange={(e) => setModelUrl(e.target.value)}
                placeholder="https://example.com/model.jpg"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              {modelUrl && isValidUrl(modelUrl) && (
                <div className="mt-3">
                  <img
                    src={modelUrl}
                    alt="Model preview"
                    className="w-full max-h-80 object-contain rounded-lg border bg-gray-50"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || !modelUrl || (!topGarmentUrl && !bottomGarmentUrl)}
              className="w-full mt-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              {isLoading ? '生成中...' : '开始生成'}
            </button>

            {isLoading && currentStep && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-3"></div>
                  <p className="text-blue-700 text-sm">{currentStep}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Right Column - Result Display */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">生成结果</h2>
            
            {finalResultUrl ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    最终结果图片 URL
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={finalResultUrl}
                      readOnly
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(finalResultUrl)}
                      className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      title="复制链接"
                    >
                      📋
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    图片预览
                  </label>
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={finalResultUrl}
                      alt="Final try-on result"
                      className="w-full h-auto object-contain"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIExvYWQgRXJyb3I8L3RleHQ+PC9zdmc+';
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => window.open(finalResultUrl, '_blank')}
                    className="bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium"
                  >
                    🔍 查看大图
                  </button>
                  <button
                    onClick={() => downloadImage(finalResultUrl)}
                    className="bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    📥 下载图片
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl">👕</span>
                </div>
                <p className="text-gray-500">
                  输入模特图片和至少一件服装的URL，点击"开始生成"查看虚拟试衣结果
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
