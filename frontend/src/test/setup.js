import '@testing-library/jest-dom'

// jsdom doesn't implement scrollTo — mock it globally
Element.prototype.scrollTo = () => {}
window.scrollTo = () => {}
