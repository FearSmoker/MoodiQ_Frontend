import { Heart, Target, Lightbulb, Users } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: Heart,
      title: 'Passion for Music',
      description: 'We believe music is more than sound—it\'s emotion, memory, and connection.'
    },
    {
      icon: Target,
      title: 'Innovation First',
      description: 'Leveraging cutting-edge AI to revolutionize how people experience their music.'
    },
    {
      icon: Lightbulb,
      title: 'User-Centric',
      description: 'Every feature is designed with your listening experience and privacy in mind.'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Built by music lovers, for music lovers, with continuous user feedback.'
    }
  ];

  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            About MoodiQ-AI
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
            We're on a mission to help you understand the emotional landscape of your music collection and create the perfect soundtrack for every moment of your life.
          </p>
        </div>

        {/* Story Section */}
        <div className="max-w-5xl mx-auto mb-20">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-3xl p-12">
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                MoodiQ-AI was born from a simple observation: music affects how we feel, but we rarely analyze why. We built this platform to bridge the gap between your playlists and your emotions.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Using advanced machine learning and audio analysis, we decode the emotional DNA of your music—helping you discover patterns, optimize flows, and create playlists that match your mood perfectly.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Whether you're looking to energize your workout, focus during study sessions, or wind down after a long day, MoodiQ-AI ensures your music always hits the right emotional note.
              </p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="flex gap-6">
                  <div className="flex-shrink-0 w-14 h-14 bg-indigo-100 dark:bg-indigo-900 rounded-xl flex items-center justify-center">
                    <Icon className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {value.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Technology */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-xl">
            <h2 className="text-3xl font-bold mb-6">The Technology</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              MoodiQ-AI combines Spotify's rich audio feature data with custom machine learning models trained on thousands of songs. We analyze:
            </p>
            <ul className="grid md:grid-cols-2 gap-4 mb-8">
              {[
                'Energy & Tempo',
                'Valence (Positivity)',
                'Acousticness',
                'Danceability',
                'Instrumentalness',
                'Speechiness',
                'Mood Transitions',
                'Lyric Sentiment'
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              This multi-dimensional analysis allows us to create accurate mood profiles and deliver intelligent recommendations tailored to your emotional preferences.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;