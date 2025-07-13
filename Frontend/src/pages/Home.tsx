import { Link } from 'react-router-dom';
import { FileSpreadsheet, BarChart3, PieChart, Shield } from 'lucide-react';

const Home = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="card mb-8 bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Welcome to FraudGuard
            </h1>
            <p className="text-blue-100 mb-6 text-lg">
              Advanced fraud detection powered by machine learning. Analyze transactions
              in real-time and identify potential fraudulent activities with high accuracy.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <Link to="/single-prediction" className="btn bg-white text-blue-700 hover:bg-blue-50">
                Start Detecting
              </Link>
              <Link to="/data-visualization" className="btn bg-blue-900/30 text-white hover:bg-blue-900/50 border border-blue-400/30">
                View Analytics
              </Link>
            </div>
          </div>
          <div className="mt-8 md:mt-0 md:ml-6 flex-shrink-0">
            <Shield className="h-32 w-32 md:h-40 md:w-40 text-blue-200 opacity-80" />
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6 text-center">Choose an Option</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard 
          title="Single Transaction" 
          description="Predict fraud for a single transaction by entering transaction details."
          icon={<BarChart3 className="h-12 w-12 text-blue-600 dark:text-blue-400" />}
          to="/single-prediction"
        />
        
        <FeatureCard 
          title="Bulk Upload" 
          description="Upload a CSV file with multiple transactions for batch processing."
          icon={<FileSpreadsheet className="h-12 w-12 text-blue-600 dark:text-blue-400" />}
          to="/bulk-upload"
        />
        
        <FeatureCard 
          title="Visualization" 
          description="View charts and analytics on transaction data and fraud patterns."
          icon={<PieChart className="h-12 w-12 text-blue-600 dark:text-blue-400" />}
          to="/data-visualization"
        />
      </div>
      
      <div className="mt-12 card bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-medium mb-4">About Fraud Detection</h3>
        <p className="mb-4">
          Our advanced fraud detection system uses machine learning algorithms to analyze transaction patterns
          and identify potential fraudulent activities in real-time. This helps businesses:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-slate-700 dark:text-slate-300">
          <li>Reduce financial losses due to fraud</li>
          <li>Protect customers from unauthorized transactions</li>
          <li>Gain insights into fraud patterns and trends</li>
          <li>Make data-driven decisions to enhance security measures</li>
        </ul>
      </div>
    </div>
  );
};

type FeatureCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
};

const FeatureCard = ({ title, description, icon, to }: FeatureCardProps) => (
  <Link to={to} className="card hover:shadow-lg group">
    <div className="flex flex-col items-center text-center">
      <div className="mb-4 transform group-hover:scale-110 transition-transform duration-200">
        {icon}
      </div>
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400">{description}</p>
      <div className="mt-4 text-blue-600 dark:text-blue-400 font-medium">
        Get Started →
      </div>
    </div>
  </Link>
);

export default Home;