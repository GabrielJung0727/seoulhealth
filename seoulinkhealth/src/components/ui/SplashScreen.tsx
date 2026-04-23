import { useEffect } from 'react'
import { motion } from 'framer-motion'

interface Props {
  onComplete: () => void
}

export default function SplashScreen({ onComplete }: Props) {
  // Fallback timer — always dismiss after 2s even if animation callbacks fail
  useEffect(() => {
    const t = setTimeout(() => {
      sessionStorage.setItem('sih_splash_shown', '1')
      onComplete()
    }, 2000)
    return () => clearTimeout(t)
  }, [onComplete])

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-brand-navy"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="text-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-wider mb-3">
          SEOU<span className="text-[#D4C4A8]">L</span><span className="text-brand-gold">INK</span>HEALTH
        </h1>
        <p className="text-sm md:text-base tracking-[0.25em] text-brand-gold uppercase">
          K-Health Business Platform
        </p>
      </motion.div>
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-brand-gold"
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      />
    </motion.div>
  )
}
