import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import InputForm from './components/InputForm';
import DietPlan from './components/DietPlan';
import SkeletonLoader from './components/SkeletonLoader';
import './index.css';

export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generatePlan = async (formData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/generate-diet-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate diet plan');
      }

      const data = await response.json();
      
      if (data.success) {
        setResult(data.plan);
      } else {
        setError('Failed to generate plan. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen w-full overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        {/* Black Background */}
        <div className="absolute inset-0 bg-black"></div>

        {/* Animated White Blobs */}
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-gray-700/10 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        ></motion.div>

        <motion.div
          className="absolute top-40 right-20 w-72 h-72 bg-gray-600/10 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        ></motion.div>

        <motion.div
          className="absolute bottom-20 left-1/2 w-72 h-72 bg-gray-600/10 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        ></motion.div>
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Error Toast */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 bg-red-600 border border-red-500 rounded-xl px-6 py-4 text-white shadow-lg z-50"
          >
            <div className="flex items-center gap-3">
              <span>❌</span>
              <span>{error}</span>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="w-full max-w-6xl">
          {!result ? (
            <InputForm onSubmit={generatePlan} loading={loading} />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                className="mx-auto block mb-8 px-6 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-semibold rounded-full transition-all duration-300"
              >
                ← Back to Form
              </motion.button>
              {loading ? <SkeletonLoader /> : <DietPlan plan={result} />}
            </motion.div>
          )}
        </div>

        {/* Floating Credits */}
        <motion.div
          className="fixed bottom-6 left-6 text-white/50 text-sm"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <p>🤖 Powered by OpenAI</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
