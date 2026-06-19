import { useState } from 'react'
import { Pencil, Brain, Smartphone } from 'lucide-react'

const CARDS = [
  {
    Icon: Pencil,
    title: 'Escribe cualquier pensamiento',
    desc: 'Sin estructura, sin categorías. Solo escribe lo que tienes en la cabeza.',
    delay: '0s',
  },
  {
    Icon: Brain,
    title: 'La IA lo organiza',
    desc: 'Categoría, resumen y palabras clave generados automáticamente.',
    delay: '0.2s',
  },
  {
    Icon: Smartphone,
    title: 'Siempre contigo',
    desc: 'Sincronizado en la nube. Accede desde cualquier dispositivo.',
    delay: '0.4s',
  },
]

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  function goToStep(next) {
    setIsVisible(false)
    setTimeout(() => {
      setStep(next)
      setIsVisible(true)
    }, 200)
  }

  return (
    <div className="onboarding-overlay">
      <div
        className="onboarding-content"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: `opacity ${isVisible ? '0.3s' : '0.2s'} ease`,
        }}
      >
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '64px', color: '#F5C842', textShadow: '0 0 30px rgba(245,200,66,0.5)', letterSpacing: '8px' }}>
              2BRAIN
            </div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '32px', color: '#E2E8F0', marginTop: '0' }}>
              Bienvenido a 2Brain
            </div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '18px', color: '#94A3B8', textAlign: 'center', maxWidth: '400px', lineHeight: 1.6 }}>
              Tu segunda mente personal. Nunca vuelvas a perder una idea.
            </div>
            <button className="onboarding-btn" onClick={() => goToStep(1)}>Comenzar →</button>
          </div>
        )}

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', width: '100%', maxWidth: '480px' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '28px', color: '#E2E8F0', textAlign: 'center' }}>
              Así funciona
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
              {CARDS.map(({ Icon, title, desc, delay }) => (
                <div key={title} className="onboarding-card" style={{ animationDelay: delay }}>
                  <Icon size={24} color="#F5C842" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '16px', color: '#E2E8F0', marginBottom: '6px' }}>
                      {title}
                    </div>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '14px', color: '#94A3B8', lineHeight: 1.6 }}>
                      {desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="onboarding-btn" onClick={() => goToStep(2)}>Entendido →</button>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '56px', color: '#F5C842', textShadow: '0 0 40px rgba(245,200,66,0.4)' }}>
              Todo listo.
            </div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '18px', color: '#94A3B8', textAlign: 'center' }}>
              Empieza capturando tu primer pensamiento.
            </div>
            <button className="onboarding-btn" onClick={onComplete}>Entrar a 2Brain</button>
          </div>
        )}
      </div>

      <div className="onboarding-dots">
        {[0, 1, 2].map(i => (
          <div key={i} className={`onboarding-dot${i === step ? ' onboarding-dot--active' : ''}`} />
        ))}
      </div>
    </div>
  )
}
