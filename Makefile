#
# A simple makefile for compiling Twee files into HTML using TweeGo
#

# define a makefile variable for the twee compiler
#
TC = tweego

FROM = ./src

# define a makefile variable for compilation flags
# the -g flag compiles with debugging information

PROJECT = Mass-Precipitate-Lab

TFLAGS = --log-files -l -o $(PROJECT).html

# typing 'make' will invoke the first target entry in the makefile 
# (the default one in this case)
#

.PHONY : clean

default : $(PROJECT).html

$(PROJECT).html :
	$(TC) $(TFLAGS) $(FROM)

# To start over from scratch, type 'make clean'.  
# Removes all .class files, so that the next make rebuilds them
#
clean : 
	$(RM) *.html