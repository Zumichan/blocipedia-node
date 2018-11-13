const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/wikis/";
const sequelize = require("../../src/db/models/index").sequelize;
const Wiki = require("../../src/db/models").Wiki;
const User = require("../../src/db/models").User;

describe("routes : wikis", () => {

  beforeEach((done) => {
     this.wiki;
     this.user;

     sequelize.sync({force: true}).then((res) => {
         Wiki.create({
           title: "Global Warming",
           body: "Learn about the science of global warming",
           private: false,
           userId: this.user.id
         })
          .then((wiki) => {
            this.wiki = wiki;
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
       })
     });//End of beforeEach

  describe("admin user performing CRUD actions for Wiki", () => {

    beforeEach((done) => {
       User.create({
         email: "admin@example.com",
         password: "123456",
         role: "admin"
       })
       .then((user) => {
         request.get({         // mock authentication
           url: "http://localhost:3000/auth/fake",
           form: {
             role: user.role,     // mock authenticate as admin user
             userId: user.id,
             email: user.email
           }
         },
           (err, res, body) => {
             done();
           }
         );
       });
     });

     describe("GET /wikis", () => {

     it("should respond with all wikis", (done) => {
          request.get(base, (err, res, body) => {
            expect(err).toBeNull();
            expect(body).toContain("Wikis");
            expect(body).toContain("Global Warming");
            done();
          });
        });
      });//End of test for GET/wikis

      describe("GET /wikis/new", () => {

        it("should render a new wiki form", (done) => {
          request.get(`${base}new`, (err, res, body) => {
            expect(err).toBeNull();
            expect(body).toContain("New Wiki");
            done();
          });
        });
      });

      describe("POST /wikis/create", () => {
      const options = {
        url: `${base}create`,
        form: {
          title: "blink-182 songs",
          body: "What's your favorite blink-182 song?"
        }
      };

      it("should create a new wiki and redirect", (done) => {
        request.post(options,
          (err, res, body) => {
            Wiki.findOne({where: {title: "blink-182 songs"}})
            .then((wiki) => {
              expect(wiki.title).toBe("blink-182 songs");
              expect(wiki.body).toBe("What's your favorite blink-182 song?");
              done();
            })
            .catch((err) => {
              console.log(err);
              done();
            });
          }
        );
      });
    });

    describe("GET /wikis/:id", () => {

     it("should render a view with the selected wiki", (done) => {
       request.get(`${base}${this.wiki.id}`, (err, res, body) => {
         expect(err).toBeNull();
         expect(body).toContain("Global Warming");
         done();
       });
     });
   });

   describe("POST /wikis/:id/destroy", () => {

     it("should delete the wiki with the associated ID", (done) => {
       Wiki.all()
       .then((wikis) => {
         const wikiCountBeforeDelete = wikis.length;
         expect(wikiCountBeforeDelete).toBe(1);
         request.post(`${base}${this.wiki.id}/destroy`, (err, res, body) => {
           Wiki.all()
           .then((wikis) => {
             expect(err).toBeNull();
             expect(wikis.length).toBe(wikiCountBeforeDelete - 1);
             done();
           })
         });
       })
     });
   });

   describe("GET /wikis/:id/edit", () => {

     it("should render a view with an edit wiki form", (done) => {
       request.get(`${base}${this.wiki.id}/edit`, (err, res, body) => {
         expect(err).toBeNull();
         expect(body).toContain("Edit Wiki");
         expect(body).toContain("Global Warming");
         done();
       });
     });
   });

   describe("POST /wikis/:id/update", () => {

    it("should update the wiki with the given values", (done) => {
       request.post = {
          url: `${base}${this.wiki.id}/update`,
          form: {
            title: "Global Warming",
            body: "Learn about the science of global warming"
          }
        },(err, res, body) => {
          expect(err).toBeNull();
          Wiki.findOne({
            where: { id:1 }
          })
          .then((wiki) => {
            expect(wiki.title).toBe("Global Warming");
            done();
          });
        }
    });
  });

});//End of test for admin user


  describe("standard user performing CRUD actions for Wiki", () => {

    beforeEach((done) => {
       request.get({
         url: "http://localhost:3000/auth/fake",
         form: {
           role: "standard"
         }
       });
           done();
         });


              describe("GET /wikis", () => {

              it("should respond with all wikis", (done) => {
                   request.get(base, (err, res, body) => {
                     expect(err).toBeNull();
                     expect(body).toContain("Wikis");
                     expect(body).toContain("Global Warming");
                     done();
                   });
                 });
               });//End of test for GET/wikis

               describe("GET /wikis/new", () => {

                 it("should render a new wiki form", (done) => {
                   request.get(`${base}new`, (err, res, body) => {
                     expect(err).toBeNull();
                     expect(body).toContain("New Wiki");
                     done();
                   });
                 });
               });

               describe("POST /wikis/create", () => {
               const options = {
                 url: `${base}create`,
                 form: {
                   title: "blink-182 songs",
                   body: "What's your favorite blink-182 song?"
                 }
               };

               it("should create a new wiki and redirect", (done) => {
                 request.post(options,
                   (err, res, body) => {
                     Wiki.findOne({where: {title: "blink-182 songs"}})
                     .then((wiki) => {
                       expect(wiki.title).toBe("blink-182 songs");
                       expect(wiki.body).toBe("What's your favorite blink-182 song?");
                       done();
                     })
                     .catch((err) => {
                       console.log(err);
                       done();
                     });
                   }
                 );
               });
             });

             describe("GET /wikis/:id", () => {

              it("should render a view with the selected wiki", (done) => {
                request.get(`${base}${this.wiki.id}`, (err, res, body) => {
                  expect(err).toBeNull();
                  expect(body).toContain("Global Warming");
                  done();
                });
              });
            });

            describe("POST /wikis/:id/destroy", () => {

              it("should delete the wiki with the associated ID", (done) => {
                Wiki.all()
                .then((wikis) => {
                  const wikiCountBeforeDelete = wikis.length;
                  expect(wikiCountBeforeDelete).toBe(1);
                  request.post(`${base}${this.wiki.id}/destroy`, (err, res, body) => {
                    Wiki.all()
                    .then((wikis) => {
                      expect(err).toBeNull();
                      expect(wikis.length).toBe(wikiCountBeforeDelete - 1);
                      done();
                    })
                  });
                })
              });
            });

            describe("GET /wikis/:id/edit", () => {

              it("should render a view with an edit wiki form", (done) => {
                request.get(`${base}${this.wiki.id}/edit`, (err, res, body) => {
                  expect(err).toBeNull();
                  expect(body).toContain("Edit Wiki");
                  expect(body).toContain("Global Warming");
                  done();
                });
              });
            });

            describe("POST /wikis/:id/update", () => {

             it("should update the wiki with the given values", (done) => {
                request.post = {
                   url: `${base}${this.wiki.id}/update`,
                   form: {
                     title: "Global Warming",
                     body: "Learn about the science of global warming"
                   }
                 },(err, res, body) => {
                   expect(err).toBeNull();
                   Wiki.findOne({
                     where: { id:1 }
                   })
                   .then((wiki) => {
                     expect(wiki.title).toBe("Global Warming");
                     done();
                   });
                 };
             });
           });

})//End of test for standard user

});
