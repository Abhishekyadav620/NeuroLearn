import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';

export const NotFoundPage = () => {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card elevated className="max-w-md w-full text-center space-y-4 border-neuro-purple/20">
        <div className="w-12 h-12 rounded-2xl bg-neuro-purple/10 border border-neuro-purple/20 flex items-center justify-center text-neuro-purpleLight mx-auto">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-white">404</h1>
        <h2 className="text-lg font-semibold text-neuro-text">Page Not Found</h2>
        <p className="text-xs text-neuro-textMuted leading-relaxed">
          The requested page or route does not exist within the NeuroLearn application.
        </p>
        <div className="pt-2">
          <Link to="/">
            <Button size="md" icon={ArrowLeft}>
              Return to Overview
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default NotFoundPage;
