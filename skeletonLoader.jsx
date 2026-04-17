import { motion } from 'framer-motion';

export default function SkeletonLoader() {
  const skeletonVariants = {
    shimmer: {
      backgroundPosition: ['200% 0', '-200% 0'],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto mt-12"
    >
      {/* Header Skeleton */}
      <div className="text-center mb-8">
        <motion.div
          variants={skeletonVariants}
          animate="shimmer"
          className="h-8 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-full mx-auto mb-4 w-64 bg-size-200"
          style={{
            backgroundSize: '200% 100%',
          }}
        />
        <motion.div
          variants={skeletonVariants}
          animate="shimmer"
          className="h-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-full mx-auto w-40"
        />
      </div>

      {/* Card Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gray-900 border border-gray-700 rounded-2xl p-6"
          >
            <motion.div
              variants={skeletonVariants}
              animate="shimmer"
              className="h-10 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-lg mb-4"
            />
            <motion.div
              variants={skeletonVariants}
              animate="shimmer"
              className="h-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-full mb-3"
            />
            <motion.div
              variants={skeletonVariants}
              animate="shimmer"
              className="h-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-full"
            />
          </motion.div>
        ))}
      </div>

      {/* Loading Text */}
      <motion.div
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-center mt-12 text-white/70 font-semibold"
      >
        ✨ AI is cooking your personalized diet plan...
      </motion.div>
    </motion.div>
  );
}
