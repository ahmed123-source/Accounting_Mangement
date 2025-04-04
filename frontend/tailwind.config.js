module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: '#3490dc',
          secondary: '#ffed4a',
          danger: '#e3342f',
          success: '#38c172',
          warning: '#f6993f',
          info: '#6574cd',
          'primary-light': '#6cb2eb',
          'primary-dark': '#2779bd',
        },
        fontFamily: {
          sans: ['Poppins', 'sans-serif'],
        }
      },
    },
    plugins: [],
  }