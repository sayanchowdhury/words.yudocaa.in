+++
title = "git config"
slug = "git-config"
authors = ["Sayan Chowdhury"]
date = 2020-05-02T18:30:00Z
tags = ["git", "series"]
+++

Git comes with this handy tool that let's you manage your Git configuration with ease.

## Configuration Levels

- `--local`

    ***(Default)*** Local configuration values are stored and managed at the repository level.
    The values are stored in a file found in the repo's `.git` directory: `.git/config`

    If you are planning to set some configuration only to be used by the specific repo you
    are in, then go ahead with using `--local`.

    ```bash
    git config --local user.email "sayan@mycompany.io"
    ```

- `--global`

    Global configuration is one level above Local. These configuration are user-specific and
    managed through the `.gitconfig` file in user's home directory: `~/.gitconfig`

    If you want your configuration to reflect to all your repo's in the system, then go ahead
    with using `--global`

    ```bash
    git config --global user.email "sayan@emailprovider.io"
    ```

- `--system`

    System-level configuration applies to every user on the system, which means if none of the
    the local or the global values overrides the system level Git configuration value will be
    used. These configurations are true for all the repos' in the system and is managed through
    the `/etc/gitconfig` file.

    ```bash
    git config --system user.email "infra@mywebsite.io"
    ```

### Listing all the configurations

- To see all the configuration values, use the command:
    ```bash
    git config --list
    ```

- It can get quite messy when you have configuration values coming from multiple sources. To see
    the origin of the value as well add `--show-origin`
    ```bash
    git config --list --show-origin
    ```

---

## Your Identity

The first chore the you always need to do after setting up Git is setting up your user name and
email address. This is required because Git attaches this piece of information to ever changeset that
you create in Git, known as Git commit.

Which level of configuration should we use? Because the details are user specific in most cases, the
optimum answer is `--global`

```bash
git config --global user.name "Sayan Chowdhury"
git config --global user.name "sayan@emailprovider.io"
```

Let's verify this in the global settings file:

```bash
$ cat ~/.gitconfig
[user]
    name = Sayan Chowdhury
	email = sayan@emailprovider.io
```

{{% note %}}
What are the other alternative will you use to verify?
{{% /note %}}
