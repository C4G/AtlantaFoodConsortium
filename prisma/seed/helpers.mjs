const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getRandomDateInPast = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date;
};

const getRandomDateInFuture = (daysAhead) => {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * daysAhead) + 1);
  return date;
};

const buildProductTypeData = (t) => {
  return {
    protein: t.protein ?? false,
    proteinTypes: t.proteinTypes ?? [],
    otherProteinType: t.proteinTypes?.includes('OTHER') ? 'Custom protein' : null,
    produce: t.produce ?? false,
    produceType: t.produceType ?? null,
    shelfStable: t.shelfStable ?? false,
    shelfStableType: t.shelfStableType ?? null,
    shelfStableIndividualServing: t.shelfStableIndividualServing ?? false,
    shelfStableIndividualServingType: t.shelfStableIndividualServingType ?? null,
    alreadyPreparedFood: t.alreadyPreparedFood ?? false,
    alreadyPreparedFoodType: t.alreadyPreparedFoodType ?? null,
    other: t.other ?? false,
    otherType: t.otherType ?? null,
  };
};

export { pick, getRandomDateInPast, getRandomDateInFuture, buildProductTypeData };
