import { useState } from 'react';

function App() {
  const [m3uUrl, setM3uUrl] = useState('');
  const [groups, setGroups] = useState({});
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setGroups({});
    setSelectedGroup(null);

    try {
      const response = await fetch('/api/process-m3u', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: m3uUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to process M3U playlist');
      }

      const data = await response.json();
      setGroups(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">SportStream</h1>
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={m3uUrl}
              onChange={(e) => setM3uUrl(e.target.value)}
              placeholder="Enter M3U playlist URL..."
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Fetch Matches'}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {Object.keys(groups).length > 0 && (
          <div>
            {selectedGroup ? (
              <div>
                <button
                  onClick={() => setSelectedGroup(null)}
                  className="mb-4 text-blue-600 hover:underline"
                >
                  ← Back to Groups
                </button>
                <h2 className="text-2xl font-semibold mb-4">{selectedGroup}</h2>
                <div className="space-y-4">
                  {groups[selectedGroup].map((entry, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow">
                      <p className="font-bold">{entry.title}</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-blue-600 break-all">{entry.link}</p>
                        <button
                          onClick={() => copyToClipboard(entry.link)}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Object.keys(groups).map((group) => (
                  <div
                    key={group}
                    onClick={() => setSelectedGroup(group)}
                    className="bg-white p-4 rounded-lg shadow flex flex-col items-center cursor-pointer hover:bg-gray-50"
                  >
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                      <span className="text-gray-500">🏀</span>
                    </div>
                    <h3 className="text-lg font-medium">{group}</h3>
                    <p className="text-sm text-gray-600">{groups[group].length} matches</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;