class Budget {
  static async createBudget(input, db, UserId) {
    const { name, amount, startDate, endDate } = input;

    const budgets = db.collection("budgets");

    // Validasi input
    if (!name || !amount || !startDate || !endDate) {
      throw new Error("All fields are required");
    }

    // Cek apakah startDate dan endDate valid
    if (new Date(startDate) >= new Date(endDate)) {
      throw new Error("Start date must be before end date");
    }

    const creating = await budgets.insertOne({
      ...input,
      spent: 0,
      income: 0,
      remaining: amount,
      isDeleted: false,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      UserId,
    });

    if (!creating.acknowledged) {
      throw new Error("Failed to create budget");
    }

    return {
      message: "Budget created successfully",
    };
  }

  static async getBudgets(db) {
    const budgets = db.collection("budgets");

    const agg = [
      {
        $match: {
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "UserId",
          foreignField: "_id",
          as: "User",
        },
      },
      {
        $unwind: {
          path: "$User",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          "User.password": 0,
        },
      },
    ];

    const findAllBudgets = await budgets.aggregate(agg).toArray();

    if (findAllBudgets.length === 0) {
      return [];
    }

    return findAllBudgets;
  }
}

module.exports = {
  Budget,
};
