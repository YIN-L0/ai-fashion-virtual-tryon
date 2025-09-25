'use client';

import { useState } from 'react';

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
  const [finalResultUrls, setFinalResultUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('');
  const [error, setError] = useState('');

  const callTryOnAPI = async (
    modelImage: string, 
    garmentImage: string, 
    retryCount = 0
  ): Promise<string> => {
    try {
      const response = await fetch('/api/tryon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model_image: modelImage,
          garment_image: garmentImage,
          num_samples: 1,
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
    setFinalResultUrls([]);
    setLoadingProgress(0);
    setLoadingText('');

    try {
      if (topGarmentUrl && bottomGarmentUrl) {
        // 两步流程：先换上装，再换下装
        // 第一步：模特 + 上装
        setLoadingProgress(30);
        setLoadingText('加载生成中.......30%');
        const intermediateUrl = await callTryOnAPI(modelUrl, topGarmentUrl);
        
        // 等待一下确保图片可访问
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 第二步：中间结果 + 下装
        setLoadingProgress(60);
        setLoadingText('加载生成中.......60%');
        const finalUrl = await callTryOnAPI(intermediateUrl, bottomGarmentUrl);
        
        // 最后渲染阶段
        setLoadingProgress(90);
        setLoadingText('加速渲染中.......90%');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setLoadingProgress(100);
        setFinalResultUrl(finalUrl);
      } else if (topGarmentUrl) {
        // 只换上装
        setLoadingProgress(30);
        setLoadingText('加载生成中.......30%');
        const finalUrl = await callTryOnAPI(modelUrl, topGarmentUrl);
        
        setLoadingProgress(90);
        setLoadingText('加速渲染中.......90%');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setLoadingProgress(100);
        setFinalResultUrl(finalUrl);
      } else if (bottomGarmentUrl) {
        // 只换下装
        setLoadingProgress(30);
        setLoadingText('加载生成中.......30%');
        const finalUrl = await callTryOnAPI(modelUrl, bottomGarmentUrl);
        
        setLoadingProgress(90);
        setLoadingText('加速渲染中.......90%');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setLoadingProgress(100);
        setFinalResultUrl(finalUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsLoading(false);
      setLoadingProgress(0);
      setLoadingText('');
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
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.download = `ai-fashion-tryon-${timestamp}.png`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      setError('下载失败，请重试或右键保存图片');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--color-background)',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
        color: 'var(--color-text-white)',
        padding: 'var(--spacing-xl) 0',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '1600px',
          margin: '0 auto',
          padding: '0 var(--spacing-lg)'
        }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 200,
            letterSpacing: '0.4em',
            marginBottom: 'var(--spacing-sm)',
            textTransform: 'uppercase',
            fontStretch: 'condensed',
            transform: 'scaleX(0.75)',
            fontFamily: '"Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}>
            AI FASHION VIRTUAL TRY ON
          </h1>
          <div style={{
            fontSize: '1.1rem',
            fontWeight: 300,
            letterSpacing: '0.1em',
            opacity: 0.9
          }}>
            AI-POWERED VIRTUAL TRY-ON EXPERIENCE
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div style={{
        maxWidth: '1600px',
        margin: '0 auto',
        padding: 'var(--spacing-xl) var(--spacing-lg)'
      }}>
        {/* Comparison Area */}
        <div style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--spacing-xl)',
          boxShadow: 'var(--shadow-md)',
          marginBottom: 'var(--spacing-xl)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 'var(--spacing-xl)',
            height: '650px',
            alignItems: 'stretch'
          }}>
            {/* Left Section - Garments */}
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{
                textAlign: 'center',
                marginBottom: 'var(--spacing-lg)',
                paddingBottom: 'var(--spacing-md)',
                borderBottom: '2px solid var(--color-border-light)'
              }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  marginBottom: 'var(--spacing-xs)',
                  color: 'var(--color-text-primary)',
                  fontFamily: '"Space Grotesk", sans-serif'
                }}>
                  GARMENTS INPUT
                </h2>
                <div style={{
                  fontSize: '0.9rem',
                  color: 'var(--color-text-secondary)',
                  fontWeight: 300,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}>
                  Upload garment images
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)', flex: 1 }}>
                {/* Top Garment */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--spacing-sm)',
                    letterSpacing: '0.05em'
                  }}>
                    上装图片 URL（可选）
                  </label>
                  <input
                    type="url"
                    value={topGarmentUrl}
                    onChange={(e) => setTopGarmentUrl(e.target.value)}
                    placeholder="https://example.com/top-garment.jpg"
                    style={{
                      width: '100%',
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                      border: '2px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.9rem',
                      fontFamily: 'Inter, sans-serif',
                      transition: 'all 0.3s ease',
                      marginBottom: 'var(--spacing-sm)'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                  />
                  {topGarmentUrl && isValidUrl(topGarmentUrl) && (
                    <div style={{
                      flex: 1,
                      border: '2px solid var(--color-border)',
                      borderRadius: 'var(--radius-lg)',
                      overflow: 'hidden',
                      background: 'transparent'
                    }}>
                      <img
                        src={topGarmentUrl}
                        alt="Top garment preview"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          objectPosition: 'center',
                          display: 'block'
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Bottom Garment */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--spacing-sm)',
                    letterSpacing: '0.05em'
                  }}>
                    下装图片 URL（可选）
                  </label>
                  <input
                    type="url"
                    value={bottomGarmentUrl}
                    onChange={(e) => setBottomGarmentUrl(e.target.value)}
                    placeholder="https://example.com/bottom-garment.jpg"
                    style={{
                      width: '100%',
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                      border: '2px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.9rem',
                      fontFamily: 'Inter, sans-serif',
                      transition: 'all 0.3s ease',
                      marginBottom: 'var(--spacing-sm)'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                  />
                  {bottomGarmentUrl && isValidUrl(bottomGarmentUrl) && (
                    <div style={{
                      flex: 1,
                      border: '2px solid var(--color-border)',
                      borderRadius: 'var(--radius-lg)',
                      overflow: 'hidden',
                      background: 'transparent'
                    }}>
                      <img
                        src={bottomGarmentUrl}
                        alt="Bottom garment preview"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          objectPosition: 'center',
                          display: 'block'
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Center Section - Model */}
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{
                textAlign: 'center',
                marginBottom: 'var(--spacing-lg)',
                paddingBottom: 'var(--spacing-md)',
                borderBottom: '2px solid var(--color-border-light)'
              }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  marginBottom: 'var(--spacing-xs)',
                  color: 'var(--color-text-primary)',
                  fontFamily: '"Space Grotesk", sans-serif'
                }}>
                  MODEL INPUT
                </h2>
                <div style={{
                  fontSize: '0.9rem',
                  color: 'var(--color-text-secondary)',
                  fontWeight: 300,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}>
                  Upload model image
                </div>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--spacing-sm)',
                  letterSpacing: '0.05em'
                }}>
                  模特图片 URL（必填）
                </label>
                <input
                  type="url"
                  value={modelUrl}
                  onChange={(e) => setModelUrl(e.target.value)}
                  placeholder="https://example.com/model.jpg"
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    border: '2px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.9rem',
                    fontFamily: 'Inter, sans-serif',
                    transition: 'all 0.3s ease',
                    marginBottom: 'var(--spacing-md)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                />

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {modelUrl && isValidUrl(modelUrl) ? (
                    <div style={{
                      flex: 1,
                      border: '2px solid var(--color-border)',
                      borderRadius: 'var(--radius-lg)',
                      overflow: 'hidden',
                      background: 'transparent',
                      marginBottom: 'var(--spacing-md)'
                    }}>
                      <img
                        src={modelUrl}
                        alt="Model preview"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          objectPosition: 'center',
                          display: 'block'
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid var(--color-border)',
                      borderRadius: 'var(--radius-lg)',
                      background: 'transparent',
                      marginBottom: 'var(--spacing-md)'
                    }}>
                      <div style={{ textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-sm)', opacity: 0.6 }}>
                          👤
                        </div>
                        <p style={{ fontSize: '1rem', margin: 0 }}>
                          输入模特图片URL
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isLoading || !modelUrl || (!topGarmentUrl && !bottomGarmentUrl)}
                  style={{
                    background: isLoading || !modelUrl || (!topGarmentUrl && !bottomGarmentUrl) 
                      ? 'var(--color-border)' 
                      : 'var(--color-primary)',
                    color: isLoading || !modelUrl || (!topGarmentUrl && !bottomGarmentUrl)
                      ? 'var(--color-text-secondary)'
                      : 'var(--color-text-white)',
                    border: '2px solid var(--color-primary)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--spacing-lg) var(--spacing-xl)',
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    cursor: isLoading || !modelUrl || (!topGarmentUrl && !bottomGarmentUrl) 
                      ? 'not-allowed' 
                      : 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'var(--spacing-sm)',
                    boxShadow: 'var(--shadow-md)',
                    fontFamily: '"Space Grotesk", sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading && modelUrl && (topGarmentUrl || bottomGarmentUrl)) {
                      e.currentTarget.style.background = 'var(--color-secondary)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading && modelUrl && (topGarmentUrl || bottomGarmentUrl)) {
                      e.currentTarget.style.background = 'var(--color-primary)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    }
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>✨</span>
                  {isLoading ? loadingText : '开始生成'}
                </button>


                {error && (
                  <div style={{
                    marginTop: 'var(--spacing-md)',
                    padding: 'var(--spacing-md)',
                    background: '#fee',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #fcc'
                  }}>
                    <p style={{ color: '#c33', fontSize: '0.9rem', margin: 0 }}>
                      {error}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Section - Results */}
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{
                textAlign: 'center',
                marginBottom: 'var(--spacing-lg)',
                paddingBottom: 'var(--spacing-md)',
                borderBottom: '2px solid var(--color-border-light)'
              }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  marginBottom: 'var(--spacing-xs)',
                  color: 'var(--color-text-primary)',
                  fontFamily: '"Space Grotesk", sans-serif'
                }}>
                  GENERATED RESULTS
                </h2>
                <div style={{
                  fontSize: '0.9rem',
                  color: 'var(--color-text-secondary)',
                  fontWeight: 300,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}>
                  Virtual try-on results
                </div>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Final Results */}
                {finalResultUrl && (
                  <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{
                      flex: 1,
                      border: '2px solid var(--color-border)',
                      borderRadius: 'var(--radius-lg)',
                      overflow: 'hidden',
                      background: 'transparent',
                      marginBottom: 'var(--spacing-md)'
                    }}>
                      <img
                        src={finalResultUrl}
                        alt="Virtual try-on result"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          objectPosition: 'center'
                        }}
                      />
                    </div>
                    
                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                      <button
                        onClick={() => navigator.clipboard.writeText(finalResultUrl)}
                        style={{
                          flex: 1,
                          background: 'var(--color-text-secondary)',
                          color: 'white',
                          padding: 'var(--spacing-sm)',
                          borderRadius: 'var(--radius-md)',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: 500
                        }}
                      >
                        📋 复制链接
                      </button>
                      <button
                        onClick={() => window.open(finalResultUrl, '_blank')}
                        style={{
                          flex: 1,
                          background: 'var(--color-accent)',
                          color: 'white',
                          padding: 'var(--spacing-sm)',
                          borderRadius: 'var(--radius-md)',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: 500
                        }}
                      >
                        🔍 查看大图
                      </button>
                      <button
                        onClick={() => downloadImage(finalResultUrl)}
                        style={{
                          flex: 1,
                          background: 'var(--color-primary)',
                          color: 'white',
                          padding: 'var(--spacing-sm)',
                          borderRadius: 'var(--radius-md)',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: 500
                        }}
                      >
                        📥 下载
                      </button>
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {!finalResultUrl && (
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    background: 'transparent'
                  }}>
                    <div style={{ textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                      <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-sm)', opacity: 0.6 }}>
                        👕
                      </div>
                      <p style={{ fontSize: '1rem', margin: 0 }}>
                        输入模特图片和至少一件服装的URL，点击"开始生成"查看虚拟试衣结果
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}