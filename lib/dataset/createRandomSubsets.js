// Helper functions
const createRandomSubsets = ({ dataset, numSubsets, subsetSize }) => {
  return Array.from({ length: numSubsets }, () =>
    dataset.sort(() => Math.random() - 0.5).slice(0, subsetSize)
  );
};

export { createRandomSubsets };
