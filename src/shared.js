function generatePackage(size, iterationNum) {
  return new Array(size).fill(null).map((_, idx) => {
    const vkUserId = iterationNum * size + idx;

    return {
      vkUserId,
      name: vkUserId.toString(16),
      profileImageUrl: `https://cdn.from-nowhere.com/avatars/${idx}`,
      isBanned: true,
      createdAt: new Date(new Date().getTime() + vkUserId),
    };
  });
}

exports.ROWS_COUNT = 4000000;
exports.DB_NAME = 'data-size-compare';
exports.TABLE_NAME = 'users';
exports.generatePackage = generatePackage;
