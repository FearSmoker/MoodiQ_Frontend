import { Heart, Sparkles, Shuffle, ArrowRightLeft, FileText, Activity, Lightbulb, Wand2 } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Heart,
      title: 'AI Mood Analysis',
      description: 'Advanced machine learning analyzes audio features to detect emotional patterns and moods in your music.',
      color: 'from-red-500 to-pink-500'
    },
    {
      icon: Sparkles,
      title: 'Flow Optimizer',
      description: 'Automatically reorder tracks for smooth mood transitions and perfect listening experience.',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      icon: Wand2,
      title: 'Mood Generator',
      description: 'Create new playlists based on specific moods or activities like study, workout, or relaxation.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: ArrowRightLeft,
      title: 'Cross-Platform Transfer',
      description: 'Seamlessly transfer playlists between Spotify, YouTube Music, and Apple Music.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: FileText,
      title: 'Lyrics Fusion',
      description: 'Analyze lyrics sentiment to refine mood predictions and display synced lyrics.',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Activity,
      title: 'Real-time Analytics',
      description: 'Live mood tracking and emotional curves while you listen to your favorite music.',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: Lightbulb,
      title: 'Smart Recommendations',
      description: 'Get personalized song suggestions based on your mood preferences and listening habits.',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Shuffle,
      title: 'Personalized Learning',
      description: 'The system learns from your feedback to provide increasingly accurate mood predictions.',
      color: 'from-teal-500 to-cyan-500'
    }
  ];

  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Powerful Features for Your Music
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Discover all the amazing capabilities of Moodify-AI to transform your music listening experience
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-12 max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Experience These Features?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of users who are already enjoying smarter music management
            </p>
            <a
              href="/"
              className="inline-block px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors shadow-xl"
            >
              Get Started Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;