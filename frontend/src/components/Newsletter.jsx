import React, { useState } from 'react';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic email validation
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Here you would typically send the email to your backend
    console.log('Subscribing email:', email);
    
    // Simulate successful subscription
    setSubscribed(true);
    setError('');
    setEmail('');
    
    // Reset subscription message after 5 seconds
    setTimeout(() => {
      setSubscribed(false);
    }, 5000);
  };

  return (
    <section className="py-16 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">Join Our Community</h2>
        <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
          Subscribe to our newsletter for exclusive offers, early access to new releases, and sneaker care tips.
        </p>
        
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-grow px-4 py-3 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
            <button
              type="submit"
              className="bg-red-500 hover:bg-red-600 px-6 py-3 rounded-full font-medium transition-colors"
            >
              Subscribe
            </button>
          </div>
          
          {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
          {subscribed && <p className="mt-2 text-green-400 text-sm">Thank you for subscribing!</p>}
          
          <p className="mt-4 text-xs text-gray-400">
            By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
          </p>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;