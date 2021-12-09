import type { LinksFunction, ActionFunction } from "remix";
import { Link, useSearchParams, json, useActionData } from "remix";
import stylesUrl from "../styles/login.css";
import * as yup from "yup";

export const links: LinksFunction = () => {
	return [{ rel: "stylesheet", href: stylesUrl }];
};

const schema = yup.object().shape({
	username: yup.string().required().min(3),
	password: yup.string().required().min(6),
});

type ActionData = {
	fieldErrors?: {
		username: string | undefined;
		password: string | undefined;
	};
	fields?: {
		loginType: string;
		username: string;
		password: string;
	};
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
	const form = await request.formData();
	const loginType = form.get("loginType");
	const username = form.get("username");
	const password = form.get("password");
	const redirectTo = form.get("redirectTo") || "/jokes";

	const fields = { loginType, username, password };

  
  const fieldErrors = {
    username: await schema.validateAt("username", { username }).then(() => undefined).catch(err => err.message),
    password: await schema.validateAt("password", { password }).then(() => undefined).catch(err => err.message),
  }
	if (Object.values(fieldErrors).some((e) => e !== undefined)) {
		return badRequest({
			fieldErrors,
			fields,
		});
	}
	return true;
};

//Function to uppercase the first letter of a string


export default function Login() {
	const actionData = useActionData<ActionData>();
	const [searchParams] = useSearchParams();
  function ucFirst(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
	return (
		<div className="container">
			<div className="content" data-light="">
				<h1>Login</h1>
				<form method="post">
					<input
						type="hidden"
						name="redirectTo"
						value={searchParams.get("redirectTo") ?? undefined}
					/>
					<fieldset>
						<legend className="sr-only">Login or Register?</legend>
						<label>
							<input
								type="radio"
								name="loginType"
								value="login"
								defaultChecked={
									!actionData?.fields?.loginType ||
									actionData?.fields?.loginType === "login"
								}
							/>{" "}
							Login
						</label>
						<label>
							<input
								type="radio"
								name="loginType"
								value="register"
								defaultChecked={
									actionData?.fields?.loginType === "register"
								}
							/>{" "}
							Register
						</label>
					</fieldset>
					<div>
						<label htmlFor="username-input">Username</label>
						<input
							type="text"
							id="username-input"
							name="username"
							defaultValue={actionData?.fields?.username}
							aria-invalid={Boolean(actionData?.fieldErrors?.username)}
							aria-describedby={
								actionData?.fieldErrors?.username
									? "username-error"
									: undefined
							}
						/>
						{actionData?.fieldErrors?.username && (
							<p
								className="form-validation-error"
								role="alert"
								id="username-error"
							>
								{ucFirst(actionData?.fieldErrors.username)}
							</p>
						)}
					</div>
					<div>
						<label htmlFor="password-input">Password</label>
						<input 
              id="password-input" 
              name="password" 
              type="password"
              defaultValue={actionData?.fields?.password}
              aria-invalid={Boolean(actionData?.fieldErrors?.password)}
              aria-describedby={
                actionData?.fieldErrors?.password
                  ? "password-error"
                  : undefined
              }
            />
            {actionData?.fieldErrors?.password && (
              <p 
                className="form-validation-error"
                role="alert"
                id="password-error"
              >
                {ucFirst(actionData?.fieldErrors.password)}
              </p>
            )}
					</div>
					<button type="submit" className="button">
						Submit
					</button>
				</form>
			</div>
			<div className="links">
				<ul>
					<li>
						<Link to="/">Home</Link>
					</li>
					<li>
						<Link to="/jokes">Jokes</Link>
					</li>
				</ul>
			</div>
		</div>
	);
}
