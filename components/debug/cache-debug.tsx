"use client"

import { useState } from "react"

interface CacheDebugProps {
  show?: boolean
}

export function CacheDebug({ show = false }: CacheDebugProps) {
  const [debugInfo, setDebugInfo] = useState<any[]>([])
  const [isVisible, setIsVisible] = useState(show)

  const testCache = async () => {
    const testQueries = ['pikachu', 'charizard', 'blastoise']
    const results: any[] = []

    for (const query of testQueries) {
      // First request
      const start1 = performance.now()
      const response1 = await fetch(`/api/tcg/search?name=${query}&pageSize=5`)
      const end1 = performance.now()
      
      // Second request (should be cached)
      const start2 = performance.now() 
      const response2 = await fetch(`/api/tcg/search?name=${query}&pageSize=5`)
      const end2 = performance.now()

      results.push({
        query,
        firstRequest: {
          time: Math.round(end1 - start1),
          headers: {
            cacheControl: response1.headers.get('cache-control'),
            cacheStatus: response1.headers.get('x-cache-status'),
            cacheTime: response1.headers.get('x-cache-time'),
            apiSource: response1.headers.get('x-api-source')
          }
        },
        secondRequest: {
          time: Math.round(end2 - start2),
          headers: {
            cacheControl: response2.headers.get('cache-control'),
            cacheStatus: response2.headers.get('x-cache-status'),
            cacheTime: response2.headers.get('x-cache-time'),
            apiSource: response2.headers.get('x-api-source')
          }
        }
      })
    }

    setDebugInfo(results)
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-purple-600 text-white px-3 py-1 text-xs rounded"
      >
        Debug Cache
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg max-w-md text-xs border border-purple-500">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-purple-300">Cache Debug</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-purple-300 hover:text-white"
        >
          ×
        </button>
      </div>
      
      <button
        onClick={testCache}
        className="bg-purple-600 text-white px-3 py-1 rounded mb-3 w-full"
      >
        Test Cache Performance
      </button>

      {debugInfo.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {debugInfo.map((result, i) => (
            <div key={i} className="border border-gray-600 p-2 rounded">
              <div className="text-purple-300 font-semibold mb-1">
                Query: {result.query}
              </div>
              
              <div className="text-green-300">
                1st Request: {result.firstRequest.time}ms
                {result.firstRequest.headers.cacheStatus && (
                  <span className="text-yellow-300 ml-2">
                    ({result.firstRequest.headers.cacheStatus})
                  </span>
                )}
              </div>
              
              <div className="text-blue-300">
                2nd Request: {result.secondRequest.time}ms
                {result.secondRequest.headers.cacheStatus && (
                  <span className="text-yellow-300 ml-2">
                    ({result.secondRequest.headers.cacheStatus})
                  </span>
                )}
              </div>
              
              <div className="text-gray-400 text-xs">
                Cache Control: {result.firstRequest.headers.cacheControl || 'None'}
              </div>
              
              {result.secondRequest.time < result.firstRequest.time / 2 && (
                <div className="text-green-400 text-xs">✅ Caching Working!</div>
              )}
              
              {result.secondRequest.time >= result.firstRequest.time / 2 && (
                <div className="text-red-400 text-xs">❌ No Cache Benefit</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 