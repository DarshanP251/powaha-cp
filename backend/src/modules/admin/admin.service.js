const applications = await prisma.cp_applications.findMany({
  where: { status: "SUBMITTED" },
  include: {
    cp: true, // 👈 joins community_partners
  },
});
