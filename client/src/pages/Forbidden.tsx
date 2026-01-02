import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Forbidden: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-8 bg-card rounded-lg shadow">
        <h1 className="text-4xl font-bold mb-2">403</h1>
        <p className="mb-4">You do not have permission to view this page.</p>
        <div className="flex justify-center gap-2">
          <Button onClick={() => navigate(-1)}>Go back</Button>
          <Button variant="outline" onClick={() => navigate('/')}>Home</Button>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;
