# UDPRN Intersection

## Brief Summary
Write a program which when given two files:
* Calculate the total and distinct count of the udprn values in each file
* Calculate distinct overlap between the values in each file
* Calculate the total overlap between the values in those files

Files will be csv and follow the below structure: <br>
udprn <br>
12312312 <br>
32132132 <br>
... <br>


## Installation + Running Instructions
Requirements:
* Git
* Docker
* Docker-compose


Steps:
* Clone the repo with git
* Manually put two files to compare into the data folder 
* Ensure docker machine is running
* Navigate to folder in terminal and enter "docker-compose up"
* Send a http get request to the docker container running (e.g. http://localhost:8080/intersection?fileA=A_f&fileB=B_f)
* This will process files A_f.csv and B_f.csv and return results
* You can then call another end point (http://localhost:8080/results) to retrieve results from previous files processed


## Implementation


Initially made it work "in-memory" but was quick to implement and I didn't think it would scale so tried to implement using a database. I took timings and recorded the results to compare the two implementations. "in memory" ran quickly with the given test files, but would struggle with larger files. This version didn't run an express app, and will only load files A_f.csv and B_f.csv.

Results for "memory" version
* Distinct udprns in A_f
* 72791
* Total in A_f
* 86526
* Distinct udprns in B_f
* 72806
* Total in B_f
* 72838
* Total overlap is:
* 69261
* Total distinct overlap is:
* 58212
---
* Time: 0.112479016

<br>

The "database" version took longer than the "in memory" version but would allow for larger file sizes. Also allows more control over storing/maintaining results. 
<br><br> 

I set this up as an express app at this point so it could be more flexible in terms of which files were loaded, seems like a more useful form:
* Have some way of uploading files to the folder
* One end point to tell the service to look through the files and store the results
* Another end point to fetch the results (I've set up an end point to retrieve results but left it very basic)
  <br><br>

Results of "database" version:
* Distinct udprns in A_f
* 72791
* Total in A_f
* 86526
* Distinct udprns in B_f
* 72806
* Total in B_f
* 72838
* Total overlap is:
* 69261
* Total distinct overlap is:
* 58212
---
* Time: 1.801465315