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
  * Default names for these files are A_f and B_f - can be changed in docker-compose.yml  
* Ensure docker machine is running
* Navigate to folder in terminal and enter "docker-compose up"


## Results

Initially made it work "in-memory" but was fairly quick + didn't think it would scale so tried to implement using a database to store the file content.

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

The "database" version took longer than the "in memory" version but would allow for larger file sizes <br><br>
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