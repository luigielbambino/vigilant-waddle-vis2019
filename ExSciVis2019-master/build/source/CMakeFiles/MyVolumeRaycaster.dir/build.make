# CMAKE generated file: DO NOT EDIT!
# Generated by "Unix Makefiles" Generator, CMake Version 3.14

# Delete rule output on recipe failure.
.DELETE_ON_ERROR:


#=============================================================================
# Special targets provided by cmake.

# Disable implicit rules so canonical targets will work.
.SUFFIXES:


# Remove some rules from gmake that .SUFFIXES does not remove.
SUFFIXES =

.SUFFIXES: .hpux_make_needs_suffix_list


# Suppress display of executed commands.
$(VERBOSE).SILENT:


# A target that is always out of date.
cmake_force:

.PHONY : cmake_force

#=============================================================================
# Set environment variables for the build.

# The shell in which to execute make rules.
SHELL = /bin/sh

# The CMake executable.
CMAKE_COMMAND = /usr/bin/cmake

# The command to remove a file.
RM = /usr/bin/cmake -E remove -f

# Escaping for special characters.
EQUALS = =

# The top-level source directory on which CMake was run.
CMAKE_SOURCE_DIR = /home/IN/tojo6854/Documents/SicVis/ExSciVis2019-master

# The top-level build directory on which CMake was run.
CMAKE_BINARY_DIR = /home/IN/tojo6854/Documents/SicVis/ExSciVis2019-master/build

# Include any dependencies generated for this target.
include source/CMakeFiles/MyVolumeRaycaster.dir/depend.make

# Include the progress variables for this target.
include source/CMakeFiles/MyVolumeRaycaster.dir/progress.make

# Include the compile flags for this target's objects.
include source/CMakeFiles/MyVolumeRaycaster.dir/flags.make

source/CMakeFiles/MyVolumeRaycaster.dir/my_volume_raycaster.cpp.o: source/CMakeFiles/MyVolumeRaycaster.dir/flags.make
source/CMakeFiles/MyVolumeRaycaster.dir/my_volume_raycaster.cpp.o: ../source/my_volume_raycaster.cpp
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green --progress-dir=/home/IN/tojo6854/Documents/SicVis/ExSciVis2019-master/build/CMakeFiles --progress-num=$(CMAKE_PROGRESS_1) "Building CXX object source/CMakeFiles/MyVolumeRaycaster.dir/my_volume_raycaster.cpp.o"
	cd /home/IN/tojo6854/Documents/SicVis/ExSciVis2019-master/build/source && /usr/bin/c++  $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -o CMakeFiles/MyVolumeRaycaster.dir/my_volume_raycaster.cpp.o -c /home/IN/tojo6854/Documents/SicVis/ExSciVis2019-master/source/my_volume_raycaster.cpp

source/CMakeFiles/MyVolumeRaycaster.dir/my_volume_raycaster.cpp.i: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Preprocessing CXX source to CMakeFiles/MyVolumeRaycaster.dir/my_volume_raycaster.cpp.i"
	cd /home/IN/tojo6854/Documents/SicVis/ExSciVis2019-master/build/source && /usr/bin/c++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -E /home/IN/tojo6854/Documents/SicVis/ExSciVis2019-master/source/my_volume_raycaster.cpp > CMakeFiles/MyVolumeRaycaster.dir/my_volume_raycaster.cpp.i

source/CMakeFiles/MyVolumeRaycaster.dir/my_volume_raycaster.cpp.s: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Compiling CXX source to assembly CMakeFiles/MyVolumeRaycaster.dir/my_volume_raycaster.cpp.s"
	cd /home/IN/tojo6854/Documents/SicVis/ExSciVis2019-master/build/source && /usr/bin/c++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -S /home/IN/tojo6854/Documents/SicVis/ExSciVis2019-master/source/my_volume_raycaster.cpp -o CMakeFiles/MyVolumeRaycaster.dir/my_volume_raycaster.cpp.s

# Object files for target MyVolumeRaycaster
MyVolumeRaycaster_OBJECTS = \
"CMakeFiles/MyVolumeRaycaster.dir/my_volume_raycaster.cpp.o"

# External object files for target MyVolumeRaycaster
MyVolumeRaycaster_EXTERNAL_OBJECTS =

build/Release/MyVolumeRaycaster: source/CMakeFiles/MyVolumeRaycaster.dir/my_volume_raycaster.cpp.o
build/Release/MyVolumeRaycaster: source/CMakeFiles/MyVolumeRaycaster.dir/build.make
build/Release/MyVolumeRaycaster: framework/libframework.a
build/Release/MyVolumeRaycaster: external/glfw-3.0.3/src/libglfw3.a
build/Release/MyVolumeRaycaster: /usr/lib/libX11.so
build/Release/MyVolumeRaycaster: /usr/lib/libXrandr.so
build/Release/MyVolumeRaycaster: /usr/lib/libXi.so
build/Release/MyVolumeRaycaster: /usr/lib/libXxf86vm.so
build/Release/MyVolumeRaycaster: /usr/lib/librt.so
build/Release/MyVolumeRaycaster: /usr/lib/libm.so
build/Release/MyVolumeRaycaster: /usr/lib/libGL.so
build/Release/MyVolumeRaycaster: source/CMakeFiles/MyVolumeRaycaster.dir/link.txt
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green --bold --progress-dir=/home/IN/tojo6854/Documents/SicVis/ExSciVis2019-master/build/CMakeFiles --progress-num=$(CMAKE_PROGRESS_2) "Linking CXX executable ../build/Release/MyVolumeRaycaster"
	cd /home/IN/tojo6854/Documents/SicVis/ExSciVis2019-master/build/source && $(CMAKE_COMMAND) -E cmake_link_script CMakeFiles/MyVolumeRaycaster.dir/link.txt --verbose=$(VERBOSE)

# Rule to build all files generated by this target.
source/CMakeFiles/MyVolumeRaycaster.dir/build: build/Release/MyVolumeRaycaster

.PHONY : source/CMakeFiles/MyVolumeRaycaster.dir/build

source/CMakeFiles/MyVolumeRaycaster.dir/clean:
	cd /home/IN/tojo6854/Documents/SicVis/ExSciVis2019-master/build/source && $(CMAKE_COMMAND) -P CMakeFiles/MyVolumeRaycaster.dir/cmake_clean.cmake
.PHONY : source/CMakeFiles/MyVolumeRaycaster.dir/clean

source/CMakeFiles/MyVolumeRaycaster.dir/depend:
	cd /home/IN/tojo6854/Documents/SicVis/ExSciVis2019-master/build && $(CMAKE_COMMAND) -E cmake_depends "Unix Makefiles" /home/IN/tojo6854/Documents/SicVis/ExSciVis2019-master /home/IN/tojo6854/Documents/SicVis/ExSciVis2019-master/source /home/IN/tojo6854/Documents/SicVis/ExSciVis2019-master/build /home/IN/tojo6854/Documents/SicVis/ExSciVis2019-master/build/source /home/IN/tojo6854/Documents/SicVis/ExSciVis2019-master/build/source/CMakeFiles/MyVolumeRaycaster.dir/DependInfo.cmake --color=$(COLOR)
.PHONY : source/CMakeFiles/MyVolumeRaycaster.dir/depend

