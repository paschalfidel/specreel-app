// components/EndpointTester.jsx
import { useState } from 'react';
import api from '../api/api';

export default function EndpointTester() {
  const [results, setResults] = useState([]);
  const [testing, setTesting] = useState(false);

  const testEndpoints = async () => {
    setTesting(true);
    const endpoints = [
      '/',
      '/movies',
      '/movies/trending',
      '/movies/popular',
      '/movies/now_playing',
      '/movies/upcoming',
      '/movies/top_rated',
      '/movies/discover',
      '/api/movies',
      '/health',
      '/users/me'
    ];

    const testResults = [];

    for (const endpoint of endpoints) {
      try {
        const response = await api.get(endpoint);
        testResults.push({
          endpoint,
          status: response.status,
          data: response.data ? 'Has data' : 'No data',
          dataStructure: response.data ? Object.keys(response.data) : 'No keys'
        });
      } catch (error) {
        testResults.push({
          endpoint,
          status: error.response?.status || 'No response',
          error: error.message
        });
      }
    }

    setResults(testResults);
    setTesting(false);
  };

  return (
    <div className="p-4 bg-surface rounded-lg">
      <h3 className="text-lg font-semibold mb-3">Backend Endpoint Tester</h3>
      <button 
        onClick={testEndpoints} 
        disabled={testing}
        className="px-4 py-2 bg-primary rounded disabled:opacity-50 mb-4"
      >
        {testing ? 'Testing...' : 'Test Endpoints'}
      </button>
      
      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((result, index) => (
            <div key={index} className={`p-2 rounded text-sm ${
              result.status === 200 ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}>
              <div className="font-mono">{result.endpoint}</div>
              <div>Status: {result.status}</div>
              {result.data && <div>Data: {result.data}</div>}
              {result.dataStructure && <div>Keys: {JSON.stringify(result.dataStructure)}</div>}
              {result.error && <div>Error: {result.error}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}