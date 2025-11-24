import React from 'react';
import { CheckCircle2, Users, Shield, TrendingUp } from 'lucide-react';

const messages = [
  {
    icon: <Users className="w-6 h-6 text-emerald-400" />,
    text: 'Built by restaurant operators who understand late nights and tight margins—built for your daily realities.',
  },
  {
    icon: <TrendingUp className="w-6 h-6 text-cyan-400" />,
    text: 'Developed through field-testing and direct operator feedback to solve the exact problems restaurant teams face.',
  },
  {
    icon: <Shield className="w-6 h-6 text-purple-400" />,
    text: 'Accuracy and auditability at every step ensures transparency and trust in your processes.',
  },
  {
    icon: <CheckCircle2 className="w-6 h-6 text-emerald-300" />,
    text: 'Join thousands of operators transforming their operations into lean, profitable enterprises.',
  },
];

export const OperatorMessaging: React.FC = () => {
  return (
    <section className="py-16 md:py-20 px-4 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Built by Operators, for Operators
          </h2>
          <p className="text-slate-300 text-lg">
            We've been in your shoes. We know what it takes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className="surface-glass border border-white/5 rounded-xl p-6 flex items-start gap-4"
            >
              <div className="flex-shrink-0 mt-1">
                {message.icon}
              </div>
              <p className="text-slate-200 text-base leading-relaxed">
                {message.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
