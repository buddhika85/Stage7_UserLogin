namespace BCMY.WebAPI.Migrations
{
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Migrations;
    using System.Linq;

    internal sealed class Configuration : DbMigrationsConfiguration<BCMY.WebAPI.Models.ApplicationDbContext>
    {
        public Configuration()
        {
            AutomaticMigrationsEnabled = false;
        }

        protected override void Seed(BCMY.WebAPI.Models.ApplicationDbContext context)
        {
            try
            {
                ApplicationDbInitializer.AddInitialRoles();
                ApplicationDbInitializer.AddInitialUsers();
                ApplicationDbInitializer.AssignRolesToUsers();
            }
            catch (System.Exception)
            {
                throw;
            }
        }
    }
}
