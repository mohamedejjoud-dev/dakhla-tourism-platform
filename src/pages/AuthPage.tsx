import React from 'react';
import { AuthModal } from '@/components/auth/AuthModal';
import { useNavigate } from 'react-router-dom';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <AuthModal
        isOpen={true}
        onClose={() => navigate(-1)}
      />
    </div>
  );
};
