# TeaCo
Ruby on Rails project containing the TeaCo server platform.

<br />
<br />
**Course Instructor**

* [Prof. Dr. rer. nat. Martin Christof Kindsmüller](mailto:martin.christof.kindsmueller@th-brandenburg.de)

**Initial Developer**

* Mathias Meusel

**Development Team (for all TeaCo-Ionic extensions)**

* [Dominic Schiller](mailto:dominic.schiller@th-brandenburg.de)<br />
Project Manager & Mobile Application Developer
* [Vasileios Roumoglou](mailto:vasileios.roumoglou@th-brandenburg.de) <br />
Mobile Application Developer
* [Iven Köthke](mailto:koethke@th-brandenburg.de) <br />
Mobile Application Developer

----------

## Prerequisites


To use and run this Ionic project, it is required that the development environment is set up as follows:


#### Tools


* [Ruby on Rails Development Kit](http://railsinstaller.org/en) must be installed (latest stable version recommended) in order to install all required gems and run the project.
* [MySQL Server](https://dev.mysql.com/downloads/) must the installed, since TeaCo uses a MySQL database. (The Community Server is recommened and fits all requirements)
* The MySQL Connector must be installed and setup with the mysql2 gem as described [here](https://tuanmsp.wordpress.com/2018/05/11/ruby-on-rails-mysql2-with-ruby-2-4-on-windows/)
* [MySQL Workbench](https://dev.mysql.com/downloads/workbench/) can be installed optionally. This is a UI-based client for managing the MySQL Server.

## Initializing the Project

Once the project has been cloned or downloaded to the local system it has to be initialized though.
<br />
To install all production and development dependencies using `Bundler` navigate to the project''s root directory and run:

```console
foo@bar:~$ bundle install 
```

 This command will install all declared gems from the RoR project's `Gemfile`.
 
## Setup the Teaco database
In MySQL the database called `teaco5` muts be manually created.
To initialize this database with all required tables, move to the project's root directory and run:

```console
foo@bar:~$ rails db:migrate
```

This command will take all migration definitions from the  `/db/migrate` directory and reconstruct the database's model based on them.


## Run the project
To finally run the project, simply enter the following:

```console
foo@bar:~$ rails server
```

This command will run the RoR server. The application itself will be accessible through the web browser by `http://localhost:3000`.