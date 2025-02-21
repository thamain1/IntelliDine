import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
    >
      <ArrowLeft className="w-5 h-5 mr-1" />
      <span>Back</span>
    </button>
  );
}